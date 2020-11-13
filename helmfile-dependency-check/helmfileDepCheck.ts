import { getInput, setOutput, setFailed } from "@actions/core"
import { existsSync, readFileSync } from "fs"
import { safeLoad } from "js-yaml"
import * as https from "https"
import * as semver from "semver"

enum HelmfileLockState {
    FRESH = "fresh",
    STALE = "stale",
    MISSING = "missing",
    UPDATE_AVAILABLE = "update_available"
}

interface HelmfileLockUpdate {
    name: string;
    repository: string;
    currentVer: string;
    latestVer: string;
}

interface ActionOutputs {
    helmfileLockState: HelmfileLockState;
    helmfileLockDelta: number;
    helmfileLockUpdates: HelmfileLockUpdate[];
}

function setOutputs({helmfileLockState, helmfileLockDelta, helmfileLockUpdates}: ActionOutputs): void {
    setOutput("helmfile-lock-state", helmfileLockState)
    setOutput("helmfile-lock-delta", helmfileLockDelta)
    setOutput("helmfile-lock-updates", helmfileLockUpdates)
}

async function getIndexYAMLData(indexURL: string) {
    return new Promise((resolve, reject) => {
        https.get(indexURL, resp => {
            let data = ""

            resp.on("data", chunk => {
                data += chunk
            })

            resp.on("end", () => {
                resolve(safeLoad(data))
            })
        }).on("error", error => {
            reject(error.message)
        })
    })
}

export async function helmfileDepCheck() {
    try {
        const outputs: ActionOutputs = {
            helmfileLockState:  HelmfileLockState.FRESH,
            helmfileLockDelta:  -1,
            helmfileLockUpdates: []
        }

        const workingDir = getInput("working-dir")
        const daysStale = parseInt(getInput("days-stale"))
        const helmfilePath = process.cwd() + "/" +  workingDir + "/helmfile.yaml"

        if (!existsSync(helmfilePath)) {
            // Return early, because there is no helmfile
            setOutputs(outputs)
            return
        }

        const helmfileContent = readFileSync(helmfilePath, "utf-8")
        const helmfileData = safeLoad(helmfileContent)

        if (!helmfileData["repositories"]) {
            // Return early, because there are no dependencies to check
            setOutputs(outputs)
            return
        } 

        const helmfileLockPath = process.cwd() + "/" +  workingDir + "/helmfile.lock"

        if (existsSync(helmfileLockPath)) {
            const helmfileLockContent = readFileSync(helmfileLockPath, "utf-8")
            const helmfileLockData = safeLoad(helmfileLockContent)
            const helmfileLockGeneratedDate = new Date(helmfileLockData["generated"])
            const currentDate = new Date()
            const millisecondsPerDay = 24 * 3600 * 1000

            const millisecondsDiff = currentDate.getTime() - helmfileLockGeneratedDate.getTime()
            const millisecondsStale = daysStale * millisecondsPerDay
            const daysDiff = Math.floor(millisecondsDiff / millisecondsPerDay)

            outputs.helmfileLockDelta = daysDiff

            if (millisecondsDiff > millisecondsStale) {
                outputs.helmfileLockState = HelmfileLockState.STALE
            }

            // Check upstream repos for upgrades
            for (const dependency of helmfileLockData["dependencies"]) {
                const indexURL = dependency["repository"] + "/index.yaml"
                const indexData = await getIndexYAMLData(indexURL)

                const dependencyName = dependency["name"]
                const dependencyVer = dependency["version"]
                if (!indexData["entries"][dependencyName]) {
                    console.log(`Could not find list of versions for ${dependencyName}`)
                    continue
                }
                const latestVer = indexData["entries"][dependencyName][0]["version"]

                if (!semver.valid(dependencyVer) || !semver.valid(latestVer)) {
                    console.log(`Invalid semantic version found: ${dependencyVer} or ${latestVer}`)
                    continue
                }

                const dependencyVerClean = semver.clean(dependencyVer)
                const latestVerClean = semver.clean(latestVer)

                if (semver.lt(dependencyVerClean, latestVerClean)) {
                    const updateData = {
                        name: dependencyName,
                        repository: indexURL,
                        currentVer: dependencyVerClean,
                        latestVer: latestVerClean
                    }
                    outputs.helmfileLockUpdates.push(updateData)
                    outputs.helmfileLockState = HelmfileLockState.UPDATE_AVAILABLE
                }
            }

        } else {
            outputs.helmfileLockState = HelmfileLockState.MISSING
        }

        setOutputs(outputs)
    } catch (error) {
        console.error(error.message)
        setFailed(`Helmfile-dep-update failure: ${error}`)
    }
}