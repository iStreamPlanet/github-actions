import * as glob from "@actions/glob";
import { getInput, setOutput } from "@actions/core";

const workspaceGlobs = getInput("workspace_globs", { required: true });
const dependencyGlobs = getInput("dependency_globs");


(async function run() {
  const changedFiles: string[] = [];

  const depsGlobber = await glob.create(dependencyGlobs);
  const dependencies = await depsGlobber.glob();

  const workspaceGlobber = await glob.create(workspaceGlobs);
  const workspaces = await workspaceGlobber.glob();

  const depsChanged = dependencies.some((d) => changedFiles.indexOf(d) >= 0);

  let result: string[];
  if (depsChanged) {
    result = workspaces;
  } else {
    result = workspaces.filter((w) =>
      changedFiles.some((f) => f.startsWith(w))
    );
  }
  console.log(`Found ${result.length} workspaces: ${result.join(", ")}`);
  setOutput("matrix", { workspace: result });
})();
