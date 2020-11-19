# helmfile-dependency-check

Simple action to check if there are updates available for charts defined in a `helmfile.yaml`

Helmfile Lock States:

- `missing` - helmfile.lock is missing (helmfile.yaml had repositories to check against)
- `update_available` - Chart updates were found in upstream repos
- `fresh` - Charts are all up to date

## Optional Inputs

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

## Example

```yaml
- uses: iStreamPlanet/github-actions/helmfile-dependency-check@main
  with:
    working_directory: .
```
