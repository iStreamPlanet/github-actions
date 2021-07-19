#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./main.sh $command $working_directory'
  exit 1
fi

# This will reduce certain non-actionable command output
# See: https://learn.hashicorp.com/tutorials/terraform/automate-terraform#controlling-terraform-output-in-automation
export TF_IN_AUTOMATION=true

workingDir="$2"
function main {
  command="$1"
  firstWord=$(echo ${command} | cut -d' ' -f1)
  remainingArgs=$(echo ${command} | cut -d' ' -f2-)

  scriptDir=$(dirname ${0})
  source ${scriptDir}/apply.sh
  source ${scriptDir}/fmt.sh
  source ${scriptDir}/init.sh
  source ${scriptDir}/plan.sh
  source ${scriptDir}/validate.sh

  case "${firstWord}" in
    apply)
      terraformApply ${remainingArgs}
      ;;
    fmt)
      terraformFmt ${remainingArgs}
      ;;
    init)
      terraformInit ${remainingArgs}
      ;;
    plan)
      terraformPlan ${remainingArgs}
      ;;
    validate)
      terraformValidate ${remainingArgs}
      ;;
    *)
      echo "Error: Unrecognized command ${command}"
      exit 1
      ;;
  esac
}

main "$1"
