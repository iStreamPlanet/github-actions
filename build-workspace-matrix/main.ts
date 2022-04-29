import * as glob from "@actions/glob";
import { getInput, setOutput, info, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";
import { relative } from "path";
import * as minimatch from "minimatch";

(async function run() {
  try {
    let result = await getWorkspaces();
    console.log(
      `Found ${result.length} impacted workspaces: ${result.join(", ")}`
    );

    const relativeToPath = getInput("relative_to_path");
    if (relativeToPath) {
      console.log(`Making relative to ${relativeToPath}`);
      result = result.map(makeRelative(relativeToPath));
    }
    setOutput("matrix", { workspace: result });
  } catch (error) {
    setFailed(error.message);
  }
})();

async function getWorkspaces(): Promise<string[]> {
  if (context.eventName === "workflow_dispatch") {
    const workspace = getInput("workflow_dispatch_workspace", {
      required: true,
    });
    return [workspace];
  }

  const workspaceGlobs = getInput("workspaces", { required: true });
  const workspaceGlobber = await glob.create(workspaceGlobs, {
    implicitDescendants: false,
  });
  const workspaces = (await workspaceGlobber.glob()).map(
    makeRelative(process.cwd())
  );

  info(`Found matching workspaces: ${workspaces.join(", ")}`);

  if (context.eventName === "schedule") {
    return workspaces;
  }

  const changedFiles = await changedFiled();
  info(`Found changed files: ${changedFiles.join(", ")}`);

  let depsChanged = false;
  const depsGlobsInput = getInput("global_dependencies");
  if (depsGlobsInput.length > 0) {
    for (const glob of depsGlobsInput.split("\n").map((g) => g.trim())) {
      if (glob.length === 0 || glob.startsWith("#")) {
        continue;
      }
      if (changedFiles.some(minimatch.filter(glob))) {
        info(`Found changed shared dependency matching glob '${glob}`);
        depsChanged = true;
        break;
      }
    }
  }

  if (depsChanged) {
    return workspaces;
  } else {
    return workspaces.filter((w) => changedFiles.some((f) => f.startsWith(w)));
  }
}

async function changedFiled(): Promise<string[]> {
  const token = getInput("github-token", { required: true });
  const github = getOctokit(token);

  let head: string;
  let base: string;
  switch (context.eventName) {
    case "push":
      const pushPayload = context.payload as PushEvent;
      head = pushPayload.after;
      base = pushPayload.before;
      break;
    case "pull_request":
      const prPayload = context.payload as PullRequestEvent;
      head = prPayload.pull_request.head.sha;
      base = prPayload.pull_request.base.sha;
      break;
    default:
      setFailed(
        `${context.eventName} is not supported when determining changed files.`
      );
      return [];
  }

  const { owner, repo } = context.repo;
  const response = await github.rest.repos.compareCommits({
    owner,
    repo,
    head,
    base,
  });

  if (response.status !== 200) {
    setFailed(`GitHub API returned response with status ${response.status}`);
    return [];
  }
  return response.data.files.map((file) => file.filename);
}

function makeRelative(from: string) {
  return function (path: string) {
    return relative(from, path);
  };
}
