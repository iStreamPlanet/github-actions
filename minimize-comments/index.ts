import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

run();

async function run() {
  try {
    const token = getInput("github-token", { required: true });
    const bodyIncludesInput = getInput("body-includes", { required: true });
    const bodyStrings = bodyIncludesInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const byAuthor = getInput("by-author", { required: true });

    const github = getOctokit(token);

    let execute = true;
    let nextCursor = undefined;
    while (execute) {
      const result = await github.graphql(
        `query FindComments($owner: String!, $repo: String!, $number: Int!, $nextCursor: String) {
          repository(owner: $owner, name: $repo) {
            pullRequest(number: $number) {
              comments(first: 50, after: $nextCursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                  hasPreviousPage
                  startCursor
                }
                nodes {
                  isMinimized
                  id
                  author {
                    login
                  }
                  body
                }
              }
            }
          }
        }`,
        { ...context.issue, nextCursor }
      );
      const {
        pageInfo,
        nodes: comments,
      } = (result as any).repository.pullRequest.comments;
      for (const comment of comments) {
        if (
          !comment.isMinimized &&
          comment.author.login === byAuthor &&
          bodyStrings.some((s) => comment.body.includes(s))
        ) {
          console.log("Minimizing " + comment.id);
          await github.graphql(
            `mutation MarkCommentOutdated($commentId: ID!) {
              minimizeComment(input: {subjectId: $commentId, classifier: OUTDATED}) {
                clientMutationId
              }
            }`,
            { commentId: comment.id }
          );
        }
      }
      execute = pageInfo.hasNextPage;
      nextCursor = pageInfo.endCursor;
    }
  } catch (error) {
    setFailed(error.message);
  }
}
