import * as glob from "@actions/glob";
import { getInput, setOutput, info, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { WebhookEventName } from "@octokit/webhooks-types";
import { relative } from "path";
import minimatch from "minimatch";
import { changedFiles } from "./changedFiles"

type supportedEvents = (("workflow_dispatch" | "push" | "pull_request") & WebhookEventName) | "schedule";

enum Flag {
  Echo = 'echo'
}

(async function run() {
  try {
    let result = await getWorkspaces({
      eventName: context.eventName as supportedEvents,
      githubToken: getInput("github-token", { required: true }),
      workspaceGlobs: getInput("workspaces", { required: true }),
      globalDependencyGlobs: getInput("global_dependencies"),
      dispatchWorkspace: getInput("workflow_dispatch_workspace", {
        required: context.eventName === "workflow_dispatch",
      }),
    });
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

export async function getWorkspaces(input: {
  eventName: supportedEvents,
  githubToken: string,
  workspaceGlobs: string,
  globalDependencyGlobs: string,
  dispatchWorkspace: string,
}): Promise<string[]> {
  if (input.eventName === "workflow_dispatch") {
    return [input.dispatchWorkspace];
  }

  const workspaceDependencies: { workspaceGlob: string, dependencyGlob: string, flag: Flag }[] = [];
  const globberInputLines: string[] = [];
  for (const line of getInputLines(input.workspaceGlobs)) {
    const [workspaceGlob, dependencyGlobWithFlag] = line.split(":").map(s => s.trim())
    globberInputLines.push(workspaceGlob)
    if (typeof dependencyGlobWithFlag === "string") {
      const [dependencyGlob, flagString] = line.split("|").map(s => s.trim())
      const flag : Flag = Flag[flagString as keyof typeof Flag] // flagString can be undefined which would result in flag being undefined and that is fine.
      workspaceDependencies.push({ workspaceGlob, dependencyGlob, flag });
    }
  }
  const workspaces = await getMatchingWorkspaces(globberInputLines.join("\n"));

  info(`Found matching workspaces: ${workspaces.join(", ")}`);

  if (input.eventName === "schedule") {
    return workspaces;
  }

  const changedFilesList = await changedFiles(input.eventName, input.githubToken);
  info(`Found changed files: ${changedFilesList.join(", ")}`);

  let globalDepsChanged = false;
  for (const glob of getInputLines(input.globalDependencyGlobs)) {
    if (changedFilesList.some(minimatch.filter(glob))) {
      info(`Found changed shared dependency matching glob '${glob}`);
      globalDepsChanged = true;
      break;
    }
  }
  if (globalDepsChanged) {
    return workspaces;
  }

  const workspacesWithChangedDependencies = new Set<string>();
  for (const {workspaceGlob, dependencyGlob, flag } of workspaceDependencies) {
    const changed = changedFilesList.some(minimatch.filter(dependencyGlob));
    if (changed) {
      if (flag === Flag.Echo) {
        info(`Echo flag found: returning workspace path as configured`);
        workspacesWithChangedDependencies.add(workspaceGlob);
      } else {
        const affectedWorkspaces = await getMatchingWorkspaces(workspaceGlob);
        info(`Found changed workspace dependency matching glob '${dependencyGlob}: ${affectedWorkspaces.join(", ")}`);
        affectedWorkspaces.forEach(w => workspacesWithChangedDependencies.add(w));
      }
    }
  }

  return workspaces.filter((w) => changedFilesList.some((f) => f.startsWith(w)) || workspacesWithChangedDependencies.has(w));
}

async function getMatchingWorkspaces(globs: string) {
  const workspaceGlobber = await glob.create(globs, {
    implicitDescendants: false,
  });
  const workspaces = (await workspaceGlobber.glob()).map(
    makeRelative(process.cwd())
  );
  return workspaces;
}

function makeRelative(from: string) {
  return function (path: string) {
    return relative(from, path);
  };
}

function getInputLines(input: string) {
  const result: string[] = [];
  for (const line of input.split("\n").map((g) => g.trim())) {
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }
    result.push(line);
  }
  return result;
}
