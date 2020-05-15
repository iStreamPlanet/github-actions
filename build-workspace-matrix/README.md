# build-workspace-matrix

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `github-token`

 workspace_globs:
    description: "A whitespace-separated list of globs representing specific workspaces"
    required: true
  dependency_globs:
    description: "A whitespace-separated list of globs representing dependencies of each workspace. If any of the dependencies have changed then all workspaces will be returned."
    required: false

**Required** The GitHub API token to use.

### `workspace_globs`

**Required** A whitespace-separated list of globs representing specific workspaces.

### `dependency_globs`

A whitespace-separated list of globs representing dependencies of each workspace. If any of the dependencies have changed then all workspaces will be returned.

## Outputs

### `matrix`

The matrix object of the following shape:

```json
{
  "workspace": [
    "match1",
    "match2"
  ]
}
```

## Example usage

````
determine-matrix:
  runs-on: ubuntu-latest
  outputs:
    matrix: ${{ steps.build-workspace-matrix.outputs.matrix }}
  steps:
  - uses: actions/checkout@master
  - id: build-workspace-matrix
    uses: iStreamPlanet/github-actions/build-workspace-matrix@master
    with:
      github-token: ${{secrets.GITHUB_TOKEN}}
      workspace_globs: |
        terraform/clusters/*/
      dependency_globs: |
        terraform/modules/**/*.tf
        .github/workflows/terraform_diff.yml
````
