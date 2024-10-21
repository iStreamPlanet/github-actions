# helmfile-push-S3

This action takes a helm chart, packages it and pushes it to a S3 repo

## Inputs
```yaml
inputs:
  aws-access-key-id:
    description: "AWS Access Key ID for the S3 bucket"
    required: true
    default: ""
  aws-secret-access-key:
    description: "AWS Secret Access Key for the S3 bucket"
    required: true
    default: ""
  chart-version:
    description: "Version charts to package"
    required: true
    default: ""
  chart-path:
    description: "Path to the helm charts to package"
    required: true
    default: ""
  github-sha:
    description: "Github SHA of the commit used to trigger the build"
    required: true
    default: ""
  repo-location:
    description: Path to the S3 helm repo
    required: true
    default: ""
  repo-region: 
    description: Region of the S3 helm repo
    required: true
    default: ""
```

## Outputs

None

## Example usage

```yaml
uses: iStreamPlanet/github-actions/helmfile-push-S3@main
with:
  aws-access-key-id: ${{ secrets.HELM_CHART_AWS_ACCESS_KEY_ID}}
  aws-secret-access-key: ${{ secrets.HELM_CHART_AWS_ACCESS_KEY_ID}}
  chart-version: 0.0.0
  chart-path: charts/pps-api
  github-sha: github
  repo-location: s3://pub-helm-repo-usw2-stage/charts
  repo-region: us-west-2
```

# Development

To build the action for distribution run `npm run build` before committing your changes.
