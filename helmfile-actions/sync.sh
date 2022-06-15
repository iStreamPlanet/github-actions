#!/bin/bash

function helmfileSync {
  set -o pipefail
  tempfile=$(mktemp)
  helmfile sync 2>&1 | tee $tempfile
  exitCode=$?
  output=$(cat $tempfile)
  rm $tempfile

  if [ ${exitCode} -eq 0 ]; then
    echo "Successfully ran helmfile sync command."
  else
    echo "Error: Failed to run helmfile sync"
  fi

  echo
  exit ${exitCode}
}
