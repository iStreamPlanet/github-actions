#!/bin/bash

ARGOCD_APP="$1"
ARGOCD_DOMAIN="$2"
ARGOCD_USER="$3"
ARGOCD_PASSWORD="$4"
CHART_PATH="$5"
CLUSTER_NAME="$6"
GITHUB_TOKEN="$7"
VALUES_FILE="$8"
USE_LOGIN_AUTH="$9"

export ARGOCD_SERVER="${ARGOCD_DOMAIN}"

RELEASE_NAME="tmp-apps-${CLUSTER_NAME}-${GITHUB_RUN_ID}"
echo ${RELEASE_NAME}
if [ $(expr length ${RELEASE_NAME}) -gt 46 ]; then
  RELEASE_NAME=$(echo "${RELEASE_NAME:0:46}")
fi

helm template ${RELEASE_NAME} ${CHART_PATH} --values ${VALUES_FILE} --debug --validate > local.yaml
yq -i '.metadata.namespace="argocd" | del(.metadata.finalizers) | del(.spec.syncPolicy.automated)' local.yaml
TMP_APPS=$(yq '.metadata.name' local.yaml -o j -M | tr -d '"')
yq -s '.metadata.name' local.yaml

if [[ "${USE_LOGIN_AUTH,,}" == "true" ]]; then
  argocd login ${ARGOCD_DOMAIN} --username "${ARGOCD_USER}" --password "${ARGOCD_PASSWORD}"
fi

for APP in ${TMP_APPS}; do
  argocd app create ${APP} -f ${APP}.yml --helm-pass-credentials
  argocd app manifests ${APP} --source=git >> update_manifests.yaml
  argocd app delete -y ${APP}
done

argocd app manifests ${ARGOCD_APP} --source=git > current_apps.yaml
CURRENT_APPS=$(yq '.metadata.name' current_apps.yaml -o j -M | tr -d '"')

for APP in ${CURRENT_APPS}; do
  argocd app manifests ${APP} --source=git >> current_manifests.yaml
done

# Below is a list of application specific fields that we want to filter out along with the general metadata fields.
#
#  ## Datadog specific fields:
#  .data.install_id:
#  .data.install_time:
YQ_FILTER='
  del(.data.install_id) |
  del(.data.install_time) |

  del(.metadata.creationTimestamp) |
  del(.metadata.generation) |
  del(.metadata.resourceVersion) |
  del(.metadata.uid) |
  del(.metadata.managedFields) |
  del(.metadata.annotations."argocd.argoproj.io/tracking-id") |
  del(.metadata.annotations."kubectl.kubernetes.io/last-applied-configuration") |
  del(.metadata.annotations."deployment.kubernetes.io/revision") |
  del(.metadata.labels."app.kubernetes.io/instance") |
  del(.metadata.labels."argocd.argoproj.io/instance") |
  del(.status)
'
GREP_FILTER='^\{\}$|^  annotations: \{\}$|^  labels: \{\}$|  vault/last-refresh:'

yq "${YQ_FILTER}" current_manifests.yaml | egrep -v "${GREP_FILTER}" > current_cleaned_manifests.yaml
yq "${YQ_FILTER}" update_manifests.yaml | egrep -v "${GREP_FILTER}" > update_cleaned_manifests.yaml

set +e
DIFF_OUTPUT=$(diff -u current_cleaned_manifests.yaml update_cleaned_manifests.yaml | tail -n +3; exit ${PIPESTATUS[0]})
DIFF_EXIT_CODE="$?"

case $DIFF_EXIT_CODE in
  0)
    DIFF_OUTPUT="===== No changes ====="
    echo "${DIFF_OUTPUT}"
    CHANGES="false"
    DIFF_STATUS="Success"
    ;;
  1)
    echo "${DIFF_OUTPUT}"
    CHANGES="true"
    DIFF_STATUS="Success"
    ;;
  *)
    CHANGES="false"
    DIFF_STATUS="Failed"
    exit $DIFF_EXIT_CODE
    ;;
esac

echo "changes-found=${CHANGES}" >> $GITHUB_OUTPUT
echo "diff-status=${DIFF_STATUS}" >> $GITHUB_OUTPUT
echo "diff-output=${DIFF_OUTPUT}" >> $GITHUB_OUTPUT
