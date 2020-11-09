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
  isMissing=false
  isStale=false
  dateDeltaDays=-1

  missingFileCode=1
  if [ ${exitStatus} -eq 0 ]; then
    echo "Info: helmfile.lock was found"
  else
    echo "Error: helmfile.lock is missing"
    isMissing=true
    exitStatus=${missingFileCode}
  fi

  if [ ${isMissing} = "false" ]; then
    dateGenerated=`cat helmfile.lock | sed -n -r "s/^generated:\s\"(.*)\"/\1/gp"`
    dateGeneratedSinceEpoch=$(date -d ${dateGenerated} +%s)
    dateCurrentSinceEpoch=$(date +%s)
    dateDeltaSeconds=$((${dateCurrentSinceEpoch} - ${dateGeneratedSinceEpoch}))
    daysStaleSeconds=$((${daysStale} * (24 * 3600)))

    staleCode=2
    if [ ${dateDeltaSeconds} -le ${daysStaleSeconds} ]; then
      echo "Info: helmfile.lock is fresh"
    else
      echo "Warning: helmfile.lock is stale"
      isStale=true
      exitStatus=${staleCode}
    fi
  fi

  echo "::set-output name=helmfile-lock-is-missing::${isMissing}"
  echo "::set-output name=helmfile-lock-is-stale::${isStale}"
  echo "::set-output name=helmfile-lock-staleness-delta::${dateDeltaDays}"
  echo
  exit $exitStatus
}

helmfileLockStaleness
