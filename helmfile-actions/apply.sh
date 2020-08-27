#!/bin/bash

function helmfileApply {
  output=$(helmfile --no-color apply ${*} 2>&1)
  exitCode=$?

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile apply command."
  else
    echo "Error: Failed to run helmfile diff"
  fi

  echo "${output}"
  echo
  exit ${exitCode}
}
