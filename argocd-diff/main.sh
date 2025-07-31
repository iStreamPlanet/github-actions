#!/bin/bash

ARGOCD_APP="$1"
ARGOCD_DOMAIN="$2"
CHART_PATH="$3"
CLUSTER_NAME="$4"
GITHUB_TOKEN="$5"
VALUES_FILE="$6"

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
CHILD_DIFF_OUTPUT=$(diff -u current_cleaned_manifests.yaml update_cleaned_manifests.yaml | tail -n +3; exit ${PIPESTATUS[0]})
CHILD_DIFF_EXIT_CODE="$?"

case $CHILD_DIFF_EXIT_CODE in
  0)
    CHILD_DIFF_OUTPUT="===== No changes ====="
    echo "${CHILD_DIFF_OUTPUT}"
    CHILD_CHANGES="false"
    CHILD_DIFF_STATUS="Success"
    ;;
  1)
    echo "${CHILD_DIFF_OUTPUT}"
    CHILD_CHANGES="true"
    CHILD_DIFF_STATUS="Success"
    ;;
  *)
    CHILD_CHANGES="false"
    CHILD_DIFF_STATUS="Failed"
    exit $CHILD_DIFF_EXIT_CODE
    ;;
esac

PARENT_DIFF_OUTPUT=$(argocd app diff ${ARGOCD_APP} --revision ${GITHUB_HEAD_REF} ; exit ${PIPESTATUS[0]})
PARENT_DIFF_EXIT_CODE="$?"

case PARENT_DIFF_EXIT_CODE in
  0)
    PARENT_DIFF_OUTPUT="===== No changes ====="
    echo "${PARENT_DIFF_OUTPUT}"
    PARENT_CHANGES="false"
    PARENT_DIFF_STATUS="Success"
    ;;
  1)
    echo "${PARENT_DIFF_OUTPUT}"
    PARENT_CHANGES="true"
    PARENT_DIFF_STATUS="Success"
    ;;
  *)
    PARENT_CHANGES="false"
    PARENT_DIFF_STATUS="Failed"
    exit $CHILD_DIFF_EXIT_CODE
    ;;
esac

CHANGES=([ ${CHILD_CHANGES} == "true" ] || [ ${PARENT_CHANGES} == "true" ])
DIFF_STATUS=([ ${CHILD_DIFF_STATUS} == "Success" ] && [ ${PARENT_DIFF_STATUS} == "Success" ]) || "Failed"

if [ ${CHANGES} == "true" ] || [ ${DIFF_STATUS} == "Failed" ]; then
  echo -e "\n\nDiff detected, posting PR comment"
  commentWrapper="## ArgoCD Diff ${DIFF_STATUS}
- Parent: \`${PARENT_DIFF_STATUS}\`
- Child: \`${CHILD_DIFF_STATUS}\`
### \`${CLUSTER_NAME}-common\`
<details>
  <summary>Parent Diff Output</summary>

\`\`\`diff
"${PARENT_DIFF_OUTPUT}"
\`\`\`

</details>

<details>
  <summary>Child Diff Output</summary>

\`\`\`diff
"${CHILD_DIFF_OUTPUT}"
\`\`\`

</details>
"
  payload=$(echo "${commentWrapper}" | jq -R --slurp '{body: .}')
  commentsURL=$(cat ${GITHUB_EVENT_PATH} | jq -r .pull_request.comments_url)
  echo "${payload}" | curl -s -S -H "Authorization: token ${GITHUB_TOKEN}" --header "Content-Type: application/json" --data @- "${commentsURL}" > /dev/null
fi
