#!/bin/bash

function terraformValidate {
  output=$(terraform validate -no-color ${*} 2>&1)
  exitCode=$?
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform validate command."
    echo "${output}"
    echo
    exit ${exitCode}
  fi

  if [ ${exitCode} -ne 0 ]; then
    echo "Error: Failed to run terraform validate"
    echo "${output}"
    echo
  fi

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && ([ "${commentStatus}" == "Failed" ]); then
    commentWrapper="#### \`terraform validate\` ${commentStatus} for \`${workingDir}\`
<details><summary>Show Output</summary>

\`\`\`
${output}
\`\`\`

</details>
"

    payload=$(echo "${commentWrapper}" | jq -R --slurp '{body: .}')
    commentsURL=$(cat ${GITHUB_EVENT_PATH} | jq -r .pull_request.comments_url)
    echo "${payload}" | curl -s -S -H "Authorization: token ${GITHUB_TOKEN}" --header "Content-Type: application/json" --data @- "${commentsURL}" > /dev/null
  fi

  # https://github.community/t5/GitHub-Actions/set-output-Truncates-Multiline-Strings/m-p/38372/highlight/true#M3322
  output="${output//'%'/'%25'}"
  output="${output//$'\n'/'%0A'}"
  output="${output//$'\r'/'%0D'}"
  echo "::set-output name=output::${output}"
  exit ${exitCode}
}
