#!/bin/bash

if [ "$#" -ne 3 ]; then
  echo 'Usage: ./main.sh $command $working_directory $header_message'
  exit 1
fi

# This will reduce certain non-actionable command output
# See: https://learn.hashicorp.com/tutorials/terraform/automate-terraform#controlling-terraform-output-in-automation
export TF_IN_AUTOMATION=true

header_message="$3"
workingDir="$2"
function main {
  command="$1"
  echo "header message 1: ${header_message}"
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
