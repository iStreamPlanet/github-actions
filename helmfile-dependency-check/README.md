# helmfile-dependency-check

Check upstream repositories for chart updates

## Inputs

```yaml
inputs:
  working_directory:
    description: "The directory to run all the commands in"
    required: false
    default: "."
```

## Outputs

```yaml
outputs:
  helmfile-lock-state:
    description: "State of the helmfile lock. [missing, fresh, update_available]"
    value: ${{ steps.main.outputs.helmfile-lock-state }}
  helmfile-lock-updates:
    description: "JSON list of available updates."
    value: ${{ steps.main.outputs.helmfile-lock-updates }}
```

## Examples

```yaml
- uses: iStreamPlanet/github-actions/helmfile-lock-stale@main
  with:
    working_directory: .
```
