# terraform-actions

There is a single `./main.sh` file that delegates down to other scripts based on the `command` that you pass in.

## Inputs
```yaml
inputs:
  command:
    description: "The terraform command to run"
    required: true
  working_directory:
    description: "The directory to run all the commands in"
    required: false
    default: "."
```

## Examples
Example usage of `terraform plan`:
```yaml
- uses: iStreamPlanet/github-actions/terraform-actions@main
  if: github.event_name == 'pull_request'
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: plan
    working_directory: terraform/
```

Example usage of `terraform apply`:
```yaml
- uses: iStreamPlanet/github-actions/terraform-actions@main
  with:
    command: apply
    working_directory: terraform/
```
