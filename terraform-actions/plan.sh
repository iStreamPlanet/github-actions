#!/bin/bash

function terraformPlan {
  set -o pipefail
  output=$(terraform plan -no-color -detailed-exitcode ${*} 2>&1 | tee /dev/tty)
  exitCode=$?
  hasChanges=false
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform plan command. No changes were found"
    echo
    echo "::set-output name=plan-has-changes::${hasChanges}"
    exit ${exitCode}
  fi

  if [ ${exitCode} -eq 2 ]; then
    # This should still be a success
    exitCode=0
    hasChanges=true
    commentStatus="Success"

    echo "Successfully ran terraform plan command. Changes were found"
    echo

    if echo "${output}" | egrep '^-{72}$' &> /dev/null; then
      # Reformat the 72 dashes that terraform uses as a horizontal divider in
      # output.  This confuses the GitHub Flavored Markdown `diff` type because
      # it thinks the dashes are all removal diffs.
      output=$(echo "${output}" | sed -n -r '/-{72}/,/-{72}/{ /-{72}/d; p }')
    fi
    # Unindent the actual diff in the output of the plan. The plan text is
    # indented once which breaks GHFM from highlighting the diff correctly.
    output=$(echo "${output}" | sed -r -e 's/^  \+/\+/g' | sed -r -e 's/^  ~/~/g' | sed -r -e 's/^  -/-/g')

     # If output is longer than max length (65536 characters), keep last part
    output=$(echo "${output}" | tail -c 65000 )
  fi

  if [ ${exitCode} -ne 0 ]; then
    echo "Error: Failed to run terraform plan"
    echo
  fi

  if [ "$GITHUB_EVENT_NAME" == "pull_request" ] && ([ "${hasChanges}" == "true" ] || [ "${commentStatus}" == "Failed" ]); then
    commentWrapper="#### \`terraform plan\` ${commentStatus} for \`${workingDir}\`
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

  echo "::set-output name=plan-has-changes::${hasChanges}"

  # https://github.community/t5/GitHub-Actions/set-output-Truncates-Multiline-Strings/m-p/38372/highlight/true#M3322
  output="${output//'%'/'%25'}"
  output="${output//$'\n'/'%0A'}"
  output="${output//$'\r'/'%0D'}"
  echo "::set-output name=plan-output::${output}"
  exit ${exitCode}
}
