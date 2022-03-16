#!/bin/bash

function terraformApply {
  set -o pipefail
  output=$(terraform apply -no-color -auto-approve -input=false ${*} 2>&1 | sudo tee /dev/tty)
  exitCode=$?

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform apply command."
  else
    echo "Error: Failed to run terraform apply"
  fi

  exit ${exitCode}
}
