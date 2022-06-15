# helmfile-actions

There is a single `./main.sh` file that delegates down to other scripts based on the `command` that you pass in.

## Inputs

```yaml
inputs:
  command:
    description: "The helmfile command to run"
    required: true
  working_directory:
    description: "The directory to run all the commands in"
    required: false
    default: "."
```

## Examples

Example usage of `helmfile diff`:

```yaml
- uses: iStreamPlanet/github-actions/helmfile-actions@main
  if: github.event_name == 'pull_request'
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: diff
    working_directory: helmfile/
```
Helmfile apply first does a diff between the last deployment and the locally rendered helmfile and deploys only the delta between the two. Helmfile apply only increments the release version if a delta is found. This may not detect manual changes made to helm releases if there is no delta between the last deployment and the current helmfile.

Example usage of `helmfile apply`:

```yaml
- uses: iStreamPlanet/github-actions/helmfile-actions@main
  with:
    command: apply
    working_directory: helmfile/
```
Helmfile sync always updates all releases and applies everything in the rendered helmfile. Sync takes longer to run but will detect and revert any manual changes made outside of the helmfile. Helmfile sync will always increment release version even if there is no change, keep this in mind if a helm rollback is required.

Example usage of `helmfile sync`:

```yaml
- uses: iStreamPlanet/github-actions/helmfile-actions@main
  with:
    command: sync
    working_directory: helmfile/
```
