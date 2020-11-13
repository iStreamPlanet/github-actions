# helmfile-dependency-check

Current Features:

- Determine if a helmfile lock file is missing or stale
- Check upstream repositories for updates

## Inputs

```yaml
inputs:
  working_directory:
    description: "The directory to run all the commands in"
    required: false
    default: "."
  days_stale:
    description: "Threshold for determining if a helmfile lock is stale or not"
    required: false
    default: 30
```

## Outputs

```yaml
outputs:
  helmfile-lock-state:
    description: "State of the helmfile lock. [missing, stale, fresh, update_available]"
    value: ${{ steps.main.outputs.helmfile-lock-state }}
  helmfile-lock-delta:
    description: "How many days stale is the lock approximately."
    value: ${{ steps.main.outputs.helmfile-lock-delta }}
  helmfile-lock-updates:
    description: "JSON list of available updates."
    value: ${{ steps.main.outputs.helmfile-lock-updates }}
```

## Examples

```yaml
- uses: iStreamPlanet/github-actions/helmfile-lock-stale@main
  with:
    working_directory: .
    days_stale: 30
```
