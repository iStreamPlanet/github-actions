import { getInput, setOutput, setFailed } from "@actions/core";
import { existsSync, readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import moment from "moment";
import path from "path";

interface ActionOutputs {
    helmfileLockState: string;
    helmfileLockDelta: number;
}

function setOutputs({helmfileLockState, helmfileLockDelta}: ActionOutputs): void {
    setOutput("helmfile-lock-state", helmfileLockState)
    setOutput("helmfile-lock-delta", helmfileLockDelta)
}

const run = async (): Promise<void> => {
    try {
        const outputs: ActionOutputs = {
            helmfileLockState:  "fresh",
            helmfileLockDelta:  -1
        }

        const workingDir = getInput("working-dir")
        const daysStale = parseInt(getInput("days-stale"))
        const helmfilePath = path.join(__dirname, workingDir, "helmfile.yaml")

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

        const helmfileLockPath = path.join(__dirname, workingDir, "helmfile.lock")

        if (existsSync(helmfileLockPath)) {
            const helmfileLockContent = readFileSync(helmfileLockPath, "utf-8")
            const helmfileLockData = safeLoad(helmfileLockContent)
            const helmfileLockGeneratedDate = moment(helmfileLockData["generated"])
            const currentDate = moment();
            const daysDiff = currentDate.diff(helmfileLockGeneratedDate, "days")
            outputs.helmfileLockDelta = daysDiff
            if (daysDiff > daysStale) {
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

run()

export default run