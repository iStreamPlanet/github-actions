#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./main.sh $command $working_directory'
  exit 1
fi

workingDir="$2"
function main {
  command="$1"
  scriptDir=$(dirname ${0})
  source ${scriptDir}/apply.sh
  source ${scriptDir}/fmt.sh
  source ${scriptDir}/init.sh
  source ${scriptDir}/plan.sh
  source ${scriptDir}/validate.sh

  case "${command}" in
    apply)
      terraformApply
      ;;
    fmt)
      terraformFmt
      ;;
    init)
      terraformInit
      ;;
    plan)
      terraformPlan
      ;;
    validate)
      terraformValidate
      ;;
    *)
      echo "Error: Unrecognized command ${command}"
      exit 1
      ;;
  esac
}

main "$1"
