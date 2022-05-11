import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { WebhookEventName, WebhookEventMap } from "@octokit/webhooks-types";

export async function changedFiles(eventName: WebhookEventName, token: string): Promise<string[]> {
  const github = getOctokit(token);

  let head: string;
  let base: string;
  switch (eventName) {
    case "push":
      const pushPayload = context.payload as WebhookEventMap[typeof eventName];
      head = pushPayload.after;
      base = pushPayload.before;
      break;
    case "pull_request":
      const prPayload = context.payload as WebhookEventMap[typeof eventName];
      head = prPayload.pull_request.head.sha;
      base = prPayload.pull_request.base.sha;
      break;
    default:
      setFailed(
        `${eventName} is not supported when determining changed files.`
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