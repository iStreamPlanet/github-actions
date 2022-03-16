#!/bin/bash

function helmfileApply {
  # suppress secrets in workflows #incident-150567
  set -o pipefail
  output=$(helmfile --no-color apply --suppress-secrets ${*} 2>&1 | tee /dev/tty)
  exitCode=$?

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile apply command."
  else
    echo "Error: Failed to run helmfile apply"
  fi

  echo
  exit ${exitCode}
}
