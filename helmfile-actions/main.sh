#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Error A command argument must be passed in"
  exit 1
fi

function stripColors {
  echo "${1}" | sed 's/\x1b\[[0-9;]*m//g'
}

function main {
  command="$1"
  source ./diff.sh

  case "${command}" in
    diff)
      helmfileDiff
      ;;
    *)
      echo "Error: Unrecognized command ${command}"
      exit 1
      ;;
  esac
}

main "${*}"
