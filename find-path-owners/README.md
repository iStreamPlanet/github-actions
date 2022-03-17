# find-path-owners javascript action

This action finds the owners of one or more paths based on the [GitHub CODEOWNERS file](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners)

## Inputs

### `path`

**Required** The path(s) to match against the CODEOWNERS file. Multiple paths can be specified as a comma-separated list.

### `codeowners`

**Optional** Path to the CODEOWNERS file. The default path is `.github/CODEOWNERS`

## Outputs

### `owners`

A JSON-encoded array of matched owners

## Example usage

```yaml
uses: iStreamPlanet/github-actions/find-path-owners@main
with:
  path: my
  by-author: github-actions
  body-includes: |
    terraform plan
    terraform validate
```

# Development

To build the action for distribution run `npm run build` before committing your changes.
