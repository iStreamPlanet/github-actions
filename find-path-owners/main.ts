import { getInput, setOutput } from "@actions/core";
import { createReadStream } from "fs";
import * as readline from "readline";
import * as minimatch from "minimatch";

const path = getInput("path", { required: true });
const codeOwnersFile = ".github/CODEOWNERS";

run(codeOwnersFile);

async function run(ownersPath: string) {
  const fileStream = createReadStream(ownersPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let matchedOwners = [];
  for await (let line of rl) {
    line = line.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const [glob, ...owners] = line.split(" ");
    if (owners.length === 0) {
      continue;
    }

    if (minimatch(path, glob)) {
      matchedOwners = owners;
    }
  }

  setOutput("owners", matchedOwners);
}
