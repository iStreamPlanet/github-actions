# Fail Alert

Sends a slack alert when a job fails

1. Add a job that you want to monitor.
2. Add a new job.
3. It must `needs` any jobs you want to monitor. Needs can accept an array.
4. set `if: ${{ failure() }}` on the new job.
5. Make the new job `uses: iStreamPlanet/github-actions/.github/workflows/fail-alert.yml@main`
6. fail-alert has no inputs, but does require a secrets.slack_webhook for whichever slack channel you want to message. 

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

