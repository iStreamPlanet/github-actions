import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

run();

async function run() {
  try {
    const token = getInput("github-token", { required: true });
    const open = getInput("open", { required: true }).toLowerCase() === "true";
    const title = getInput("title", { required: true });
    const body = getInput("body");
    const closeComment = getInput("close-comment");
    const github = getOctokit(token);

    async function closeIssue(issue: number, comment: string) {
      if (comment) {
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue,
          body: comment,
        });
      }
      await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue,
        state: "closed",
      });
    }

    let issues = (
      await github.paginate(github.rest.issues.listForRepo, {
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "open",
      })
    ).filter((i) => i.title === title);

    if (open) {
      if (issues.length) {
        const issue = issues[0];
        await github.rest.issues.update({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          body,
        });
      } else {
        await github.rest.issues.create({
          owner: context.repo.owner,
          repo: context.repo.repo,
          title,
          body,
        });
      }
    } else if (issues.length) {
      const issue = issues[0];
      await closeIssue(issue.number, closeComment);
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
