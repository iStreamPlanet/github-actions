# Fail Alert

Sends a slack alert when a job fails

[fail-alert.yml](/.github/workflows/fail-alert.yml)

The alert contains the name of the repo, the workflow and the GitHub user who triggered the 
workflow. 

Anyone who triggers workflows should add their GitHub username as a [keyword](https://slack.com/help/articles/201355156-Configure-your-Slack-notifications#keyword-notifications) in Slack.

1. Add any jobs that you want to monitor.
2. Add a new job.
3. It must `needs` any jobs you want to monitor. Needs can accept an array.
4. Set `if: ${{ failure() }}` on the new job.
5. Make the new job `uses: iStreamPlanet/github-actions/.github/workflows/fail-alert.yml@main`
6. fail-alert has no inputs, but does require a `secrets.slack_webhook` for whichever slack channel you want to message. 

Here's an example workflow 

```
name: Project X

on:
  push 

jobs:
  build:
    runs-on: ubuntu-latest
    steps
    - name: Something Fails!
      run: |
        exit 1

  notify:
    needs: build
    if: ${{ failure() }}
    uses: iStreamPlanet/github-actions/.github/workflows/fail-alert.yml@main
    secrets:
      slack_webhook: ${{ secrets.DEPLOYMENTS_SLACK_WEBHOOK }}
```                                                                  

## Future Improvements

* Get an org-wide webhook and call it from within fail-alert. Users wouldn't need to have one.
* Accept optional inputs to override values from github. E.G. workflow name, contact etc...
* Better slack message formatting with Block Kit.
* Somehow map gh users to slack name and do a real @
  * Make an actual slack app that looks it up on a table or something
  * Have users put their slack @handle in gh profile and look that up somehow?
