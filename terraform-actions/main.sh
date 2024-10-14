#!/bin/bash

if [ "$#" -ne 3 ]; then
  echo 'Usage: ./main.sh $command $working_directory $header_message'
  exit 1
fi

# This will reduce certain non-actionable command output
# See: https://learn.hashicorp.com/tutorials/terraform/automate-terraform#controlling-terraform-output-in-automation
export TF_IN_AUTOMATION=true

workingDir="$2"
function main {
  command="$1"
  header_message="$2"
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
      terraformFmt $header_message
      ;;
    init)
      terraformInit $header_message
      ;;
    plan)
      terraformPlan $header_message
      ;;
    validate)
      terraformValidate $header_message
      ;;
    *)
      echo "Error: Unrecognized command ${command}"
      exit 1
      ;;
  esac
}

main "$1"
