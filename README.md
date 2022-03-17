# github-actions

Repository of generic reusable Github Actions and Workflows

## actions

#### [`build-workspace-matrix`](build-workspace-matrix)

Builds a [workflow build matrix](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow#configuring-a-build-matrix) based on glob patterns and which files have changed in a PR/push.

#### [`helmfile-actions`](helmfile-actions)

Wraps certain [`helmfile`](https://github.com/roboll/helmfile) commands and annotates PRs with their output.

#### [`helmfile-dependency-check`](helmfile-dependency-check)

Checks if there is a valid `helmfile.yaml` in the working directory. Executes `helmfile deps` and checks if there are any chart upgrades available.

#### [`minimize-comments`](minimize-comments)

Minimizes issue/PR comments matching the given criteria. Use this in a workflow to hide the comments generated by previous runs of a job (for example, when new commits are pushed to a PR branch).

#### [`terraform-actions`](terraform-actions)

Wraps certain [`terraform`](https://www.terraform.io/docs/commands/index.html) commands and annotates PRs with their output.

#### [`trufflehog-actions-scan`](trufflehog-actions-scan)

Runs Trufflehog as a GitHub Action.  Based off of [`https://github.com/edplato/trufflehog-actions-scan`](https://github.com/edplato/trufflehog-actions-scan).  Uses Dependabot to stay up-to-date with the latest version.

#### [`update-issue`](update-issue)

Creates, updates, or closes an issue matching a given title based on other parameters.
