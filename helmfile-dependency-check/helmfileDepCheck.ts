import { getInput, setOutput, setFailed } from "@actions/core";
import { existsSync, readFileSync } from "fs";
import { safeLoad } from "js-yaml";

interface ActionOutputs {
    helmfileLockState: string;
    helmfileLockDelta: number;
}

function setOutputs({helmfileLockState, helmfileLockDelta}: ActionOutputs): void {
    setOutput("helmfile-lock-state", helmfileLockState)
    setOutput("helmfile-lock-delta", helmfileLockDelta)
}

export function helmfileDepCheck() {
    try {
        const outputs: ActionOutputs = {
            helmfileLockState:  "fresh",
            helmfileLockDelta:  -1
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
                outputs.helmfileLockState = "stale"
            }

        } else {
            outputs.helmfileLockState = "missing"
        }

        setOutputs(outputs)
    } catch (error) {
        console.error(error.message)
        setFailed(`Helmfile-dep-update failure: ${error}`)
    }
}