#!/bin/bash

function terraformValidate {
  set -o pipefail
  output=$(terraform validate -no-color ${*} 2>&1 | sudo tee /dev/tty)
  exitCode=$?
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform validate command."
    echo
    exit ${exitCode}
  fi

  echo "Error: Failed to run terraform validate"
  echo

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && [ "${commentStatus}" == "Failed" ]; then
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

  exit ${exitCode}
}
