import { getInput, setOutput } from "@actions/core";
import { createReadStream } from "fs";
import * as readline from "readline";
import * as minimatch from "minimatch";

const paths = getInput("path", { required: true });
const codeOwnersFile = getInput("codeowners", { required: true });

run(codeOwnersFile);

async function run(ownersPath: string) {
  const fileStream = createReadStream(ownersPath);
  console.log('Getting owners for the following paths:')
  console.log(`${paths.split(",").join("\n")}`)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let matchedOwners = new Set<string>();
  for await (let line of rl) {
    line = line.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const [glob, ...owners] = line.split(" ");
    if (owners.length === 0) {
      continue;
    }

    for (let path in paths.split(",")) {
      path = path.trim();
      if (minimatch(path, glob)) {
        owners.forEach(item => matchedOwners.add(item))
      }
    }
  }

  setOutput("owners", [...matchedOwners]);
}
