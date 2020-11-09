#!/bin/bash

function helmfileStaleness {
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
    dateDeltaDays=$((${dateDeltaSeconds} / (24*3600)))

    staleCode=2
    if [ ${dateDeltaDays} -le ${daysStale} ]; then
      echo "Info: helmfile.lock is fresh"
    else
      echo "Warning: helmfile.lock is stale"
      isStale=true
      exitStatus=${staleCode}
    fi
  fi

  echo "::set-output name=helmfile-is-missing::${isMissing}"
  echo "::set-output name=helmfile-is-stale::${isStale}"
  echo "::set-output name=helmfile-staleness-delta::${dateDeltaDays}"
  echo
  exit $exitStatus
}
