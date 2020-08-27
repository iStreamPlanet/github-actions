import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

const token = getInput("github-token", { required: true });
const body = getInput("body", { required: true });
const title = getInput("title", { required: true });
const hasChanges = getInput("has-changes", { required: true }) === "true";

run({
  token,
  body,
  title,
  hasChanges,
});

async function run({ token, body, title, hasChanges }) {
  try {
    const github = getOctokit(token);

    async function closeIssue(issue: number, comment: string) {
      await github.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue,
        body: comment,
      });
      await github.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue,
        state: "closed",
      });
    }

    let issues = (
      await github.paginate(github.issues.listForRepo, {
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "open",
        labels: "drift",
      })
    ).filter((i) => i.title === title);

    if (hasChanges) {
      if (issues.length) {
        const issue = issues[0];
        await github.issues.update({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          body,
        });
      } else {
        await github.issues.create({
          owner: context.repo.owner,
          repo: context.repo.repo,
          title,
          labels: ["drift"],
          body,
        });
      }
    } else if (issues.length) {
      const issue = issues[0];
      await closeIssue(
        issue.number,
        "No changes detected in latest run, closing."
      );
    }
    for (let i = 1; i < issues.length; i++) {
      const issue = issues[i];
      await closeIssue(
        issue.number,
        `Closing as duplicate of #${issues[0].number}.`
      );
    }
  } catch (error) {
    setFailed(error.message);
  }
}
