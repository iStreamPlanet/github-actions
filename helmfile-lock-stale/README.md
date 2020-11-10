# helmfile-lock-stale

Action to determine if a helmfile lock file is missing or stale.

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
    description: "State of the helmfile lock. i.e. missing, stale, fresh"
    value: ${{ steps.main.outputs.helmfile-lock-state }}
  helmfile-lock-staleness-delta-approx:
    description: "How many days stale is the lock approximately"
    value: ${{ steps.main.outputs.helmfile-lock-staleness-delta-approx }}
```

## Examples

```yaml
- uses: iStreamPlanet/github-actions/helmfile-lock-stale@main
  with:
    working_directory: .
    days_stale: 30
```
