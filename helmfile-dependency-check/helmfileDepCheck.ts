import { getInput, setOutput, setFailed } from "@actions/core"
import { existsSync, readFileSync } from "fs"
import { safeLoad } from "js-yaml"
import { execSync } from "child_process"
import { join } from "path"

enum HelmfileLockState {
    FRESH = "fresh",
    MISSING = "missing",
    UPDATE_AVAILABLE = "update_available"
}

interface HelmfileLockUpdate {
    name: string;
    repository: string;
    currentVer: string;
    upgradeVer: string;
}

interface ActionOutputs {
    helmfileLockState: HelmfileLockState;
    helmfileLockUpdates: HelmfileLockUpdate[];
}

function setOutputs({helmfileLockState, helmfileLockUpdates}: ActionOutputs): void {
    setOutput("helmfile-lock-state", helmfileLockState)
    setOutput("helmfile-lock-updates", helmfileLockUpdates)
}

export function helmfileDepCheck() {
    try {
        const outputs: ActionOutputs = {
            helmfileLockState:  HelmfileLockState.FRESH,
            helmfileLockUpdates: []
        }

        const workingDir = join(process.cwd(), getInput("working_directory"))
        const helmfilePath = workingDir + "/helmfile.yaml"

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

        const helmfileLockPath = workingDir + "/helmfile.lock"

        if (!existsSync(helmfileLockPath)) {
            outputs.helmfileLockState = HelmfileLockState.MISSING
            setOutputs(outputs)
            return
        }

        const currentHelmfileLockContent = readFileSync(helmfileLockPath, "utf-8")
        const currentHelmfileLockData = safeLoad(currentHelmfileLockContent)
        const currentDependencies: Record<string, string>[] = currentHelmfileLockData["dependencies"]
        const currentGenerated: string = currentHelmfileLockData["generated"]

        try {
            const execResult = execSync("helmfile deps", { cwd: workingDir }).toString();
            console.log(execResult)
        } catch (error) {
            console.error(error.message)
            setOutputs(outputs)
            return
        }

        const newHelmfileLockContent = readFileSync(helmfileLockPath, "utf-8")
        const newHelmfileLockData = safeLoad(newHelmfileLockContent)
        const newDependencies: Record<string, string>[] = newHelmfileLockData["dependencies"]
        const newGenerated: string = newHelmfileLockData["generated"]

        if (Date.parse(currentGenerated) >= Date.parse(newGenerated)) {
            console.log(`new helmfile.lock was not generated`)
            setOutputs(outputs)
            return
        }
        
        if (currentDependencies.length !== newDependencies.length) {
            console.log(`dependency length mismatch after running helmfile deps`)
            setOutputs(outputs)
            return
        }

        for (let i = 0; i < currentDependencies.length; i++) {
            const curDependency = currentDependencies[i]
            const curRepo = curDependency["repository"]
            const curDependencyName = curDependency["name"]
            const curDependencyVer = curDependency["version"]

            const newDependency = newDependencies[i]
            const newDependencyVer = newDependency["version"]

            if (curDependencyVer !== newDependencyVer) {
                const updateData = {
                    name: curDependencyName,
                    repository: curRepo,
                    currentVer: curDependencyVer,
                    upgradeVer: newDependencyVer
                }
                outputs.helmfileLockUpdates.push(updateData)
            }
        }

        if (outputs.helmfileLockUpdates.length) {
            outputs.helmfileLockState = HelmfileLockState.UPDATE_AVAILABLE
        }

        setOutputs(outputs)
    } catch (error) {
        console.error(error.message)
        setFailed(`Helmfile-dep-update failure: ${error}`)
    }
}