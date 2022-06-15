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

Example usage of `helmfile apply`:

```yaml
- uses: iStreamPlanet/github-actions/helmfile-actions@main
  with:
    command: apply
    working_directory: helmfile/
```

Example usage of `helmfile sync`:

```yaml
- uses: iStreamPlanet/github-actions/helmfile-actions@main
  with:
    command: sync
    working_directory: helmfile/
```
