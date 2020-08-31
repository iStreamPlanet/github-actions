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

## Dynamic list based on `push`/`pull_request` file changes

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "terraform/clusters/*/*.tf"

jobs:
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
          # Only matching workspaces that contain changes will be returned (except for /example, which is excluded)
          workspace_globs: |
            terraform/clusters/*/
            !terraform/clusters/example/
          # Unless something in global dependencies changes, in which case all workspaces are returned
          global_dependencies: |
            terraform/modules/**/*.tf

  build:
    needs: [determine-matrix]
    strategy:
      fail-fast: false
      matrix: ${{ fromJson(needs.determine-matrix.outputs.matrix) }}
    defaults:
      run:
        working-directory: ${{ matrix.workspace }}
    steps:
      - uses: actions/checkout@v2
      - run: pwd
```

## All matching workspaces on a `schedule`

```yaml
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    # Runs at 9 AM Pacific Time every weekday
    - cron: "0 16 * * 1-5"

jobs:
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
          # All workspaces returned
          workspace_globs: |
            terraform/clusters/*/
          # Global dependencies not evaluated in this case
          global_dependencies: ""
```

## Single workspace provided via a `workflow_dispatch` input

```yaml
on:
  workflow_dispatch:
    inputs:
      workspace:
        description: "The path to the Terraform workspace"
        required: true

jobs:
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
          # A matrix with a single value provided by the input is returned
          workflow_dispatch_workspace: ${{ github.event.inputs.workspace }}
