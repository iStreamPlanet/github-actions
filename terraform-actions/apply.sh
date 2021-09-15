#!/bin/bash

function terraformApply {
  
  terraform apply -no-color -auto-approve -input=false ${*} 2>&1
  exitCode=$?

  echo
  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran terraform apply command."
  else
    echo "Error: Failed to run terraform apply"
  fi

  exit ${exitCode}
}
