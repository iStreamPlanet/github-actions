#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./main.sh $working_directory $days_stale'
  exit 1
fi

workingDir="$1"
daysStale="$2"

function helmfileLockStaleness {
  helmfileContent=$(<helmfile.lock)
  exitStatus=$?
  helmfileState=""
  dateDeltaDaysApprox=-1

  if [ ${exitStatus} -eq 0 ]; then
    echo "Info: helmfile.lock was found"
    helmfileState="found" 
  else
    echo "Error: helmfile.lock is missing"
    helmfileState="missing" 
  fi

  if [ ${helmfileState} = "found" ]; then
    dateGenerated=`cat helmfile.lock | sed -n -r "s/^generated:\s\"(.*)\"/\1/gp"`
    dateGeneratedSinceEpoch=$(date -d ${dateGenerated} +%s)
    dateCurrentSinceEpoch=$(date +%s)
    dateDeltaSeconds=$((${dateCurrentSinceEpoch} - ${dateGeneratedSinceEpoch}))
    daysStaleSeconds=$((${daysStale} * (24 * 3600)))
    dateDeltaDaysApprox=$((${dateDeltaSeconds} / (24*3600)))

    if [ ${dateDeltaSeconds} -le ${daysStaleSeconds} ]; then
      echo "Info: helmfile.lock is fresh"
      helmfileState="fresh"
    else
      echo "Warning: helmfile.lock is stale"
      helmfileState="stale"
    fi
  fi

  echo "::set-output name=helmfile-lock-state::${helmfileState}"
  echo "::set-output name=helmfile-lock-staleness-delta-approx::${dateDeltaDaysApprox}"
  echo
  exit 0
}

helmfileLockStaleness
