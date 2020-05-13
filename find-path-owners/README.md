# find-path-owners javascript action

This action finds the owners of a given path based on the [GitHub CODEOWNERS file](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners)

## Inputs

### `path`

**Required** The path to match against the CODEOWNERS file.

## Outputs

### `owners`

A JSON-encoded array of matched owners

## Example usage

```yaml
uses: iStreamPlanet/github-actions/find-path-owners@master
with:
  path: my
  by-author: github-actions
  body-includes: |
    terraform plan
    terraform validate
```

# Development

To build the action for distribution run `npm run build` before committing your changes.