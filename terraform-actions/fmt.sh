#!/bin/bash

function terraformFmt {
  set -o pipefail
  echo "Attempting tempfile"
  tempfile=$(mktemp)
  terraform fmt -check=true -write=false -diff -recursive -no-color ${*} 2>&1 | tee $tempfile
  exitCode=$?
  output=$(cat $tempfile)
  rm $tempfile
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform fmt command."
    echo
    exit ${exitCode}
  fi

  echo "Error: terraform fmt found changes"
  echo

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && [ "${commentStatus}" == "Failed" ]; then
    commentWrapper="#### \`terraform fmt\` ${commentStatus} for \`${workingDir}\`
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

  exit ${exitCode}
}
