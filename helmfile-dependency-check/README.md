# helmfile-dependency-check

Simple action to check if there are updates available for charts defined in a `helmfile.yaml`

Helmfile Lock States:

- `missing` - helmfile.lock is missing (helmfile.yaml had repositories to check against)
- `update_available` - Chart updates were found
- `fresh` - Charts are all up to date

## Optional Inputs

```yaml
inputs:
  working_directory:
    description: "The directory to run all the commands in"
    required: false
    default: "."
```

## Outputs

```yaml
outputs:
  helmfile-lock-state:
    description: "State of the helmfile lock. [missing, fresh, update_available]"
    value: ${{ steps.main.outputs.helmfile-lock-state }}
  helmfile-lock-updates:
    description: "JSON list of available updates."
    value: ${{ steps.main.outputs.helmfile-lock-updates }}
```

## Example Usage

```yaml
- uses: iStreamPlanet/github-actions/helmfile-dependency-check@main
  with:
    working_directory: .
```

## Update Available Example

helmfile.lock:

```
version: v0.125.0
dependencies:
- name: datadog
  repository: https://helm.datadoghq.com
  version: 2.4.39
- name: external-dns
  repository: https://charts.bitnami.com/bitnami
  version: 2.24.1
- name: kube-state-metrics
  repository: https://charts.helm.sh/stable
  version: 2.9.2
- name: metrics-server
  repository: https://charts.helm.sh/stable
  version: 2.11.2
- name: spotinst-kubernetes-cluster-controller
  repository: https://spotinst.github.io/spotinst-kubernetes-helm-charts
  version: 1.0.78
digest: sha256:aa71df80f65944a2281269415dc193943f50d9d7bf2763017ee1d9d9539ac116
generated: "2020-11-06T15:12:37.407096-08:00"
```

Raw output:

```
::set-output name=helmfile-lock-state::update_available
::set-output name=helmfile-lock-updates::[{"name":"kube-state-metrics","repository":"https://charts.helm.sh/stable","currentVer":"2.9.2","upgradeVer":"2.9.4"},{"name":"metrics-server","repository":"https://charts.helm.sh/stable","currentVer":"2.11.2","upgradeVer":"2.11.4"},{"name":"spotinst-kubernetes-cluster-controller","repository":"https://spotinst.github.io/spotinst-kubernetes-helm-charts","currentVer":"1.0.78","upgradeVer":"1.0.79"}]
```

Formatted:

```yaml
[
  {
    "name": "kube-state-metrics",
    "repository": "https://charts.helm.sh/stable",
    "currentVer": "2.9.2",
    "upgradeVer": "2.9.4",
  },
  {
    "name": "metrics-server",
    "repository": "https://charts.helm.sh/stable",
    "currentVer": "2.11.2",
    "upgradeVer": "2.11.4",
  },
  {
    "name": "spotinst-kubernetes-cluster-controller",
    "repository": "https://spotinst.github.io/spotinst-kubernetes-helm-charts",
    "currentVer": "1.0.78",
    "upgradeVer": "1.0.79",
  },
]
```

## Fresh Example

helmfile.lock

```
version: v0.125.0
dependencies:
- name: datadog
  repository: https://helm.datadoghq.com
  version: 2.4.39
- name: external-dns
  repository: https://charts.bitnami.com/bitnami
  version: 2.24.1
- name: kube-state-metrics
  repository: https://charts.helm.sh/stable
  version: 2.9.4
- name: metrics-server
  repository: https://charts.helm.sh/stable
  version: 2.11.4
- name: spotinst-kubernetes-cluster-controller
  repository: https://spotinst.github.io/spotinst-kubernetes-helm-charts
  version: 1.0.79
digest: sha256:ff3b0ad50accb9a12898773752efe2cbdc7004003be46506c68a3f70cb28ff34
generated: "2020-11-30T13:15:00.561501952-08:00"
```

Raw output:

```
new helmfile.lock was not generated
::set-output name=helmfile-lock-state::fresh
::set-output name=helmfile-lock-updates::[]
```
