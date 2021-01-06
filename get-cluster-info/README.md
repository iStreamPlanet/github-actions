# get-cluster-info

Simple action that gathers info about EKS clusters.

This action assumes that asdf and python are installed is installed.

## Optional Inputs

```yaml
inputs:
  working_directory:
    description: "The base path for a repository"
    required: true
```

## Outputs
None

The output of this action is a markdown file that contains a table the info for all clusters

## Example Usage

```yaml
- uses: iStreamPlanet/github-actions/get-cluster-info@main
  with:
    working_directory: .
```

## Example File Output

|  Cluster    |  EKS Version   | Region | Helm Version |
| ----------- | ----------- | ------ | ------------ |
| example-cluster-1 | 1.18 | us-west-2 | 3.1.4 |
| example-cluster-2 | 1.16 | us-east-1 | 2.9.5 |

