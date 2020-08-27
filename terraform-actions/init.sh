#!/bin/bash

function terraformInit {
  output=$(terraform init -no-color -input=false ${*} 2>&1)
  exitCode=$?
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform init command."
    echo "${output}"
    echo
    exit ${exitCode}
  fi

  echo "Error: Failed to run terraform init"
  echo "${output}"
  echo

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && [ "${commentStatus}" == "Failed" ]; then
    commentWrapper="#### \`terraform init\` ${commentStatus} for \`${workingDir}\`
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
