#!/bin/bash

function terraformFmt {
  set -o pipefail
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

  echo "command-outcome=${commentStatus}" >> "$GITHUB_OUTPUT"
  echo "command-output<<EOT" >> $GITHUB_OUTPUT
  echo "${output}" >> $GITHUB_OUTPUT
  echo "EOT" >> $GITHUB_OUTPUT

  echo "Error: terraform fmt found changes"
  echo

  exit ${exitCode}
}
