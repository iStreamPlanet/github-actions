#!/bin/bash

function terraformApply {
  set -o pipefail
  tempfile=$(mktemp)
  terraform apply -no-color -auto-approve -input=false ${*} 2>&1 | tee $tempfile
  exitCode=${PIPESTATUS[0]}
  output=$(cat $tempfile)
  rm $tempfile

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform apply command."
  else
    echo "Error: Failed to run terraform apply"
  fi

  exit ${exitCode}
}
