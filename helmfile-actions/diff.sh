#!/bin/bash

function helmfileDiff {
  set -o pipefail
  tempfile=$(mktemp)
  # suppress secrets in workflows #incident-150567
  helmfile --no-color diff --detailed-exitcode --suppress-secrets ${*} 2>&1 | tee $tempfile
  exitCode=$?
  output=$(cat $tempfile)
  rm $tempfile
  hasChanges=false
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile diff command. No changes were found"
    echo
    echo "diff-has-changes=${hasChanges}" >> $GITHUB_OUTPUT
    exit ${exitCode}
  fi

  if [ ${exitCode} -eq 2 ]; then
    # This should still be a success
    exitCode=0
    hasChanges=true
    commentStatus="Success"

    echo "Successfully ran helmfile diff command. Changes were found"
    echo

     # If output is longer than max length (65536 characters), keep last part
    output=$(echo "${output}" | tail -c 65000 )
  fi

  if [ ${exitCode} -ne 0 ]; then
    echo "Error: Failed to run helmfile diff"
    echo
    
    # If output is longer than max length (65536 characters), keep last part
    output=$(echo "${output}" | tail -c 65000 )
  fi

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && ([ "${hasChanges}" == "true" ] || [ "${commentStatus}" == "Failed" ]); then
    commentWrapper="#### \`helmfile diff\` ${commentStatus} for \`${workingDir}\`
<details><summary>Show Output</summary>

\`\`\`diff
${output}
\`\`\`

</details>
"

    payload=$(echo "${commentWrapper}" | jq -R --slurp '{body: .}')
    commentsURL=$(cat ${GITHUB_EVENT_PATH} | jq -r .pull_request.comments_url)
    echo "${payload}" | curl -s -S -H "Authorization: token ${GITHUB_TOKEN}" --header "Content-Type: application/json" --data @- "${commentsURL}" > /dev/null
  fi

  echo "diff-has-changes=${hasChanges}" >> $GITHUB_OUTPUT

  echo "diff-output<<EOF" >> $GITHUB_OUTPUT
  echo "${output}" >> $GITHUB_OUTPUT
  echo "EOF" >> $GITHUB_OUTPUT
  exit ${exitCode}
}
