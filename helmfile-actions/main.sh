#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./main.sh $command $working_directory'
  exit 1
fi

function stripColors {
  echo "${1}" | sed 's/\x1b\[[0-9;]*m//g'
}

workingDir="$2"
function main {
  command="$1"
  scriptDir=$(dirname ${0})
  source ${scriptDir}/diff.sh

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

main "$1"
