import argparse
import os
import re
import subprocess
from multiprocessing.dummy import Pool

from jinja2 import Template

parser = argparse.ArgumentParser()
parser.add_argument("--output_path", 
                    default="CLUSTERINFO.md", 
                    type=str)
args = parser.parse_args()

OUTPUT_PATH = args.output_path
THREADPOOL_SIZE = 5
BASE_PATH = os.getcwd()
HELM_VERSION_REGEX = re.compile(r"helm\s+(\d+\.\d+\.\d+)")

TEMPLATE_DATA = """
|  Cluster    |  EKS Version   | Region | Helm Version |
| ----------- | ----------- | ------ | ------------ |
{% for cluster in clusters -%}
| {{cluster.name}} | {{cluster.cluster_version}} | {{cluster.region}} | {{cluster.helm_version}} |
{% endfor %}
"""


class Cluster:
    def __init__(self, cluster_path):
        self.cluster_path = cluster_path
        self.helm_path = (self.cluster_path).replace('clusters', 'helmfiles')
        self.name = os.path.basename(self.cluster_path)
        self.region = os.path.basename(os.path.dirname(self.cluster_path))

    def get_helm_version(self):
        tools_file = f"{self.helm_path}/.tool-versions"
        try:
            with open(tools_file) as f:
                match = re.match(HELM_VERSION_REGEX, f.read())
            self.helm_version = match.group(1)
        except Exception:
            self.helm_version = "unknown"

    def get_cluster_version(self):
        try:
            subprocess.run(["asdf", "install"], check=True, capture_output=True,
                           cwd=self.cluster_path, text=True)
            subprocess.run(["terraform", "init"], cwd=self.cluster_path,
                           check=True, capture_output=True, text=True)
            version = subprocess.run(["terraform", "output", "-json", "cluster_version"],
                                     cwd=self.cluster_path, capture_output=True, text=True)
            if version.stdout:
                self.cluster_version = ((version.stdout).strip()).strip('"')
            else:
                self.cluster_version = 'unknown'
        except Exception:
            self.cluster_version = 'unknown'


def create_markdown(clusters: list, template: str):
    temp = Template(template)
    return temp.render(clusters=clusters)


def generate_file_list(path: str, file_name: str):
    file_list = []
    for root, _, files in os.walk(path):
        for name in files:
            if name == file_name:
                file_list.append(root)
    return file_list


def write_file(path: str, data: str):
    with open(path, "w") as f:
        f.write(data)


def runner(cluster):
    cluster.get_helm_version()
    cluster.get_cluster_version()


def main():
    clusters = []
    file_list = sorted(generate_file_list(BASE_PATH, 'provider.tf'))
    for f in file_list:
        clusters.append(Cluster(f))

    pool = Pool(THREADPOOL_SIZE)
    pool.map(runner, clusters)
    pool.close()
    pool.join()

    md_data = create_markdown(clusters, TEMPLATE_DATA)
    write_file(OUTPUT_PATH, md_data)
    print(md_data)


main()
