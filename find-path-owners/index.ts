import { getInput, setOutput } from "@actions/core";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import * as minimatch from "minimatch";

const path = getInput("path", { required: true });
const codeOwnersFile = ".github/CODEOWNERS";

run(codeOwnersFile);

async function run(ownersPath: string) {
  console.log(`Opening file '${ownersPath}' in '${process.cwd()}'`);
  const fileStream = createReadStream(ownersPath);

  const rl = createInterface({
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

    const [glob, ...owners] = line.split(/\s+/).filter((s) => s.length > 0);
    if (owners.length === 0) {
      continue;
    }

    let pathToTest = path;
    if (glob.endsWith("**") && !path.endsWith("/")) {
      // append a "/" to end of path because otherwise minimatch won't match a
      // path like "clusters/aws/us-east-1/origin-prod-use1-b" to glob "**/origin-*/**"
      pathToTest = `${pathToTest}/`;
    }

    console.log(`Evaluating path '${path}' against glob '${glob}'`);
    if (minimatch(pathToTest, glob)) {
      matchedOwners = owners;
    }
  }

  const logins = [];
  const teams = [];
  for (const owner of matchedOwners) {
    if (isTeam(owner)) {
      teams.push(owner);
    } else {
      logins.push(owner);
    }
  }
  console.log(
    `found ${matchedOwners.length} owners: ${matchedOwners.join(", ")}`
  );
  setOutput("owners", matchedOwners);
  setOutput("teamOwners", teams);
  setOutput("loginOwners", logins);
}

function isTeam(s: string) {
  return s.includes("/");
}
