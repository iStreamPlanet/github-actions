# get-commit-owners

This action returns a list of commit owners associated with the specified commit based on the required `CODEOWNERS` file

## Inputs

### `auth_token`

**Required** Token used for authenticating the API cal

### `codeowners`

**Optional** Path to the CODEOWNERS file. The default path is `.github/CODEOWNERS`

### `repository`

**Required** The repository to which the commit belongs in the form {owner}/{repo}

### `sha`

**Required** The SHA of the commit

## Outputs

### `owners`

The owner of the commit

## Examples

Example usage:

```yaml
jobs:
  get_webhook_urls:
    runs-on: ubuntu-latest
    outputs:
      owners: ${{ steps.commit_owners.outputs.owners }}
    steps:
        - uses: iStreamPlanet/github-actions/get-commit-owners@main
          id: commit_owners
          with:
            auth_token: ${{ secrets.GITHUB_TOKEN }}
            repository: ${{ github.repository }}
            sha: ${{ github.sha }}
```

Example usage with non-default `CODEOWNERS` path:

```yaml
jobs:
  get_webhook_urls:
    runs-on: ubuntu-latest
    outputs:
      owners: ${{ steps.commit_owners.outputs.owners }}
    steps:
        - uses: iStreamPlanet/github-actions/get-commit-owners@main
          id: commit_owners
          with:
            auth_token: ${{ secrets.GITHUB_TOKEN }}
            codeowners: "./CODEOWNERS"
            repository: ${{ github.repository }}
            sha: ${{ github.sha }}
```
