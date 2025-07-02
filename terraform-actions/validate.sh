#!/bin/bash

function terraformValidate {
  set -o pipefail
  tempfile=$(mktemp)
  terraform validate -no-color ${*} 2>&1 | tee $tempfile
  exitCode=$?
  output=$(cat $tempfile)
  rm $tempfile
  commentStatus="Failed"

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform validate command."
    echo
    exit ${exitCode}
  fi

  echo "command-outcome=${commentStatus}" >> "$GITHUB_OUTPUT"
  echo "command-output<<EOT" >> $GITHUB_OUTPUT
  echo "${output}" >> $GITHUB_OUTPUT
  echo "EOT" >> $GITHUB_OUTPUT

  echo "Error: Failed to run terraform validate"
  echo

  exit ${exitCode}
}
