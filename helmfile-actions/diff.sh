#!/bin/bash

function helmfileDiff {
  output=$(helmfile --no-color diff --detailed-exitcode ${*} 2>&1)
  exitCode=$?
  hasChanges=false
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile diff command. No changes were found"
    echo "${output}"
    echo
    echo "::set-output name=has-changes::${hasChanges}"
    exit ${exitCode}
  fi

  if [ ${exitCode} -eq 2 ]; then
    # This should still be a success
    exitCode=0
    hasChanges=true
    commentStatus="Success"

    echo "Successfully ran helmfile diff command. Changes were found"
    echo "${output}"
    echo

    if echo "${output}" | egrep '^-{72}$' &> /dev/null; then
        output=$(echo "${output}" | sed -n -r '/-{72}/,/-{72}/{ /-{72}/d; p }')
    fi
    output=$(echo "${output}" | sed -r -e 's/^  \+/\+/g' | sed -r -e 's/^  ~/~/g' | sed -r -e 's/^  -/-/g')

     # If output is longer than max length (65536 characters), keep last part
    output=$(echo "${output}" | tail -c 65000 )
  fi

  if [ ${exitCode} -ne 0 ]; then
    echo "Error: Failed to run helmfile diff"
    echo "${output}"
    echo
  fi

  env
  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && ([ "${hasChanges}" == "true" ] || [ "${commentStatus}" == "Failed" ]); then
    commentWrapper="#### \`helmfile diff\` ${commentStatus} for \`${INPUT_WORKING_DIRECTORY}\`
<details><summary>Show Output</summary>

\`\`\`diff
${output}
\`\`\`

</details>
"

    commentWrapper=$(stripColors "${commentWrapper}")
    payload=$(echo "${commentWrapper}" | jq -R --slurp '{body: .}')
    commentsURL=$(cat ${GITHUB_EVENT_PATH} | jq -r .pull_request.comments_url)
    echo "${payload}" | curl -s -S -H "Authorization: token ${GITHUB_TOKEN}" --header "Content-Type: application/json" --data @- "${commentsURL}" > /dev/null
  fi

  echo "::set-output name=has-changes::${hasChanges}"

  # https://github.community/t5/GitHub-Actions/set-output-Truncates-Multiline-Strings/m-p/38372/highlight/true#M3322
  output="${output//'%'/'%25'}"
  output="${output//$'\n'/'%0A'}"
  output="${output//$'\r'/'%0D'}"
  echo "::set-output name=output::${output}"
  exit ${exitCode}
}
