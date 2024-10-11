# build-workspace-matrix

Builds a matrix of workspaces based on glob patterns and analysis of which files have changed

## Inputs

### `github-token`

**Required** The GitHub API token to use.

### `workspaces`

**Required** A newline-separated list of globs or dependency glob expressions representing specific workspaces. A `!` can be used to exclude certain patterns.
A dependency glob expression looks like `foo/*/ : bar/**/*` - if anything under `bar` changes then all workspaces matching `foo/*/` are returned. Furthermore, the
dependency glob expression may also contain a `flag` in the form of `foo/*/ : bar/**/* | <flag>`.

#### Flags
| Flag   | Behavior                                                                                                                          |
|--------|-----------------------------------------------------------------------------------------------------------------------------------|
| `Echo` | The tool will return the exact workspace path as specified without attempting to match the glob pattern to an existing directory. |

### `workflow_dispatch_workspace`

A particular workspace to return when the event type is `workflow_dispatch`.

### `global_dependencies`

A newline-separated list of globs representing dependencies of each workspace. If any of the dependencies have changed then all workspaces will be returned.

### `relative_to_path`

If provided, results will be relative to the given path

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
          workspaces: |
            # Only matching workspaces that contain changes will be returned
            terraform/clusters/*/
            # except for /example, which is excluded
            !terraform/clusters/example/
            # additionally, if any *.tf file under shared_modules/foo or shared_modules/bar (recursively)
            # is changed, all workspaces matching product-a-* will be returned
            terraform/clusters/product-a-*/ : shared_modules/foo/*.tf
            terraform/clusters/product-a-*/ : shared_modules/bar/**/*.tf
          global_dependencies: |
            # If something in global dependencies changes then all matched workspaces are returned
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
          workspaces: |
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
```
