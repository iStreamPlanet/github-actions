#!/bin/bash

function terraformApply {
  output=$(terraform apply -no-color ${*} 2>&1)
  exitCode=$?

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform apply command."
  else
    echo "Error: Failed to run terraform apply"
  fi

  echo "${output}"
  echo
  exit ${exitCode}
}
