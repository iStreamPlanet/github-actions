#!/bin/bash

function helmfileApply {
  # suppress secrets in workflows #incident-150567
  set -o pipefail
  tempfile=$(mktemp)
  helmfile --no-color apply --suppress-secrets ${*} 2>&1 | tee $tempfile
  exitCode=$?
  output=$(cat $tempfile)
  rm $tempfile

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile apply command."
  else
    echo "Error: Failed to run helmfile apply"
  fi

  echo
  exit ${exitCode}
}
