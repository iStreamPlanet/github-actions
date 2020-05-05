# minimize-comments javascript action

This action minimizes all comments by the specified user which include the given string in the comment body

## Inputs

### `github-token`

**Required** The GitHub API token to use.

### `by-author`

**Required** The id of the comment author to match.

### `body-includes`

**Required** The string that must be present in the body of the comment for it to be minimized.

## Outputs

None

## Example usage

uses: actions/hello-world-javascript-action@v1
with:
  github-token: ${{secrets.GITHUB_TOKEN}}
  by-author: github-actions
  body-includes: terraform plan

# Development

To build the action for distribution run `npm run build` before committing your changes.