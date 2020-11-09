#!/bin/bash

if [ "$#" -ne 3 ]; then
  echo 'Usage: ./main.sh $command $working_directory $days_stale'
  exit 1
fi

workingDir="$2"
daysStale="$3"
function main {
  command="$1"
  scriptDir=$(dirname ${0})
  source ${scriptDir}/diff.sh
  source ${scriptDir}/apply.sh
  source ${scriptDir}/staleness.sh

  case "${command}" in
    diff)
      helmfileDiff
      ;;
    apply)
      helmfileApply
      ;;
    staleness)
      helmfileStaleness
      ;;
    *)
      echo "Error: Unrecognized command ${command}"
      exit 1
      ;;
  esac
}

main "$1"
