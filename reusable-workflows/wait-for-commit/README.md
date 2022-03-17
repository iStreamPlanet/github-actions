# wait-for-commit

**Note** All reusable workflows are required to be located in `.github/workflows`

This is a `reusable workflow` that can be used to pause a workflow's execution until all GitHub [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)  \
complete. Once all `status checks` for the associated commit finish, the workflow will resume and will make the outputs \
listed below available.

The primary purpose of this reusable workflow is to pause execution of the parent workflow and to gathers information \
that the parent will need in order to send out notifications based on the result of the `status checks` for the associated commit. \
The information gathered includes the summarized result of the `status checks` (`status`), the owners of the respective files being modified \
as defined in [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) (`commit_owners`), and a list of repository [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) names for dynamically accessing the \
necessary secrets for sending notifications (`secret_names_array`).

Finally, a word regarding the repository `Encrypted Secrets`. When a repository has multiple `owners`, as defined in \
`CODEOWNERS`, special considerations have to be given regarding how `Encrypted Secrets` are managed and accessed. \
For this reason, this workflow makes the assumption that all `owners` maintain a separate `secret` which includes the \
identifier the `owners` specified in `CODEOWNERS`, i.e `@username`, `@org/team-name`, or `user@example.com`, with the exception \
that `Encrypted Secrets` names must only contain alphanumeric characters as well as `-` and `_`. Therefore, the `@` and `/` found \
in the `owners` identifier should be replaced to comply. An example of a secret name that would work is `ACTIONS_SECRET__username` where \
the `@` character has been replaced by a `_`. This name can be achieved by using a `secret_name_prefix` argument of `ACTIONS_SECRET_`.

## Inputs

### `caller_job`

**Required** Name of the job that calls this workflow

### `check_interval`

**Optional** The amount of seconds to wait between checks, adjust depending on the expected time all the checks and related CI's will take

### `secret_name_prefix`

**Optional** String to prepend to all secret names in the array

### `secret_name_suffix`

**Optional** String to append to all secret names in the array

### `string_replace_rules`

**Optional** JSON encoded dictionary of regex that will be applied for replacing characters in the new secret names array. The key is the regex, and value is the replacement

## Outputs

### `commit_owners`

Array of owners for the current commit based on the CODEOWNERS file and the updated files

### `secret_names_array`

An array of strings containing the names of the secrets built from the name of the owners

### `status`

Overall status of the commit that triggered the workflow

## Examples

Example usage:

```yaml
name: Notification Workflow
on:
  push:
    branches:
      - main
jobs:
  wait_for_commits:
    uses: iStreamPlanet/github-actions/.github/workflows/wait-for-commit.yml@main
    with:
      # This value has to be added manually and must match the job name. This argument ensures that this job is ignored,
      # when waiting for status checks to complete, otherwise this job will get stuck waiting for itself to finish. 
      # Unfortunately 'github.job' is not available here
      caller_job: wait_for_commits
      secret_name_prefix: "ACTION_SECRET_"
      # Rule to replace all '/' and '@' characters with '_'
      string_replace_rules: '{"/[\/@]/g": "_"}'
  
  slack_notification:
    needs: [wait_for_commits]
    if: needs.wait_for_commits.outputs.status != 'success'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        secret_name: ${{ fromJSON(needs.wait_for_commits.outputs.secret_names_array) }}
    steps:
      # Signals the notification step to run iff the corresponding secret exists 
      - name: Check if secret exists
        id: send_message
        run: if [ -z "${{ secrets[matrix.secret_name] }}" ]; then echo "::set-output name=run::false"; fi
      - name: Slack Notification
        uses: rtCamp/action-slack-notify@v2
        if: steps.send_message.outputs.run != 'false'
        env:
          SLACK_WEBHOOK: ${{ secrets[matrix.secret_name] }}
          SLACK_LINK_NAMES: true
          SLACK_COLOR: ${{ needs.wait_for_commits.outputs.status }}
```
