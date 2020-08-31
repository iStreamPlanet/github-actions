# build-workspace-matrix

Builds a matrix of workspaces based on glob patterns and analysis of which files have changed

## Inputs

### `github-token`

**Required** The GitHub API token to use.

### `workspaces`

**Required** A newline-separated list of globs representing specific workspaces.

### `global_dependencies`

A newline-separated list of globs representing dependencies of each workspace. If any of the dependencies have changed then all workspaces will be returned.

## Outputs

### `matrix`

The matrix object of the following shape:

```json
{
  "workspace": ["match1", "match2"]
}
```

## Example usage

```
determine-matrix:
  runs-on: ubuntu-latest
  outputs:
    matrix: ${{ steps.build-workspace-matrix.outputs.matrix }}
  steps:
  - uses: actions/checkout@v2
  - id: build-workspace-matrix
    uses: iStreamPlanet/github-actions/build-workspace-matrix@main
    with:
      github-token: ${{secrets.GITHUB_TOKEN}}
      workspace_globs: |
        terraform/clusters/*/
      dependency_globs: |
        terraform/modules/**/*.tf
        .github/workflows/terraform_diff.yml
```
