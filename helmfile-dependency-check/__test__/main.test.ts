jest.mock("fs")
jest.mock("child_process")

import * as path from "path"

const baseDir = "helmfile-dependency-check/__test__/test-data/"

const {readFileSync} = jest.requireActual("fs")

beforeEach(() => {
    jest.resetModules()
    require("fs").__setMockFiles([])
})

afterEach(() => {
    delete process.env["INPUT_WORKING_DIRECTORY"]
})

describe("helmfile-dep-update", () => {
    it("helmfile missing", () => {
        const workingDir = path.join(baseDir, "helmfile-missing")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")

        require("../helmfileDepCheck").helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
    it("helmfile missing repositories", () => {
        const workingDir = path.join(baseDir, "helmfile-no-repositories")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const helmfilePath = path.join(workingDir, "helmfile.yaml")
        const helmfileContent = readFileSync(helmfilePath, "utf-8")

        const mockFiles = [
            helmfileContent,
        ]
        require("fs").__setMockFiles(mockFiles)

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")

        require("../helmfileDepCheck").helmfileDepCheck()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
    it("helmfile lock fresh", () => {
        const workingDir = path.join(baseDir, "helmfile-lock-fresh")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const helmfilePath = path.join(workingDir, "helmfile.yaml")
        const helmfileContent = readFileSync(helmfilePath, "utf-8")

        const helmfileLockPath = path.join(workingDir, "helmfile.lock")
        const helmfileLockContent = readFileSync(helmfileLockPath, "utf-8")

        const freshHelmfileLockPath = path.join(workingDir, "helmfile_fresh.lock")
        const freshHelmfileLockContent = readFileSync(freshHelmfileLockPath, "utf-8")

        const mockFiles = [
            helmfileContent,
            helmfileLockContent,
            freshHelmfileLockContent,
        ]
        require("fs").__setMockFiles(mockFiles)

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")
        const logMock = jest.spyOn(global.console, "log")

        require("../helmfileDepCheck").helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
        expect(logMock).toHaveBeenCalledWith("executed: helmfile deps")
    })
    it("helmfile lock no updates", () => {
        const workingDir = path.join(baseDir, "helmfile-lock-fresh")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const helmfilePath = path.join(workingDir, "helmfile.yaml")
        const helmfileContent = readFileSync(helmfilePath, "utf-8")

        const helmfileLockPath = path.join(workingDir, "helmfile.lock")
        const helmfileLockContent = readFileSync(helmfileLockPath, "utf-8")

        const freshHelmfileLockPath = path.join(workingDir, "helmfile.lock")
        const freshHelmfileLockContent = readFileSync(freshHelmfileLockPath, "utf-8")

        const mockFiles = [
            helmfileContent,
            helmfileLockContent,
            freshHelmfileLockContent,
        ]
        require("fs").__setMockFiles(mockFiles)

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")
        const logMock = jest.spyOn(global.console, "log")

        require("../helmfileDepCheck").helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
        expect(logMock).toHaveBeenCalledWith("new helmfile.lock was not generated")
    })
    it("helmfile lock update", () => {
        const workingDir = path.join(baseDir, "helmfile-lock-update")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const helmfilePath = path.join(workingDir, "helmfile.yaml")
        const helmfileContent = readFileSync(helmfilePath, "utf-8")

        const helmfileLockPath = path.join(workingDir, "helmfile.lock")
        const helmfileLockContent = readFileSync(helmfileLockPath, "utf-8")

        const updatedHelmfileLockPath = path.join(workingDir, "helmfile_updated.lock")
        const updatedHelmfileLockContent = readFileSync(updatedHelmfileLockPath, "utf-8")

        const mockFiles = [
            helmfileContent,
            helmfileLockContent,
            updatedHelmfileLockContent,
        ]
        require("fs").__setMockFiles(mockFiles)

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")
        const logMock = jest.spyOn(global.console, "log")

        require("../helmfileDepCheck").helmfileDepCheck()

        const updateData = [
            {
                name: "datadog",
                repository: "https://helm.datadoghq.com",
                currentVer: "2.4.39",
                upgradeVer: "2.5.1"
            },
            {
                name: "spotinst-kubernetes-cluster-controller",
                repository: "https://spotinst.github.io/spotinst-kubernetes-helm-charts",
                currentVer: "1.0.78",
                upgradeVer: "1.0.79"
            }
        ]

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "update_available")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", updateData)
        expect(logMock).toHaveBeenCalledWith("executed: helmfile deps")
    })
    it("helmfile lock missing", () => {
        const workingDir = path.join(baseDir, "helmfile-lock-missing")
        process.env["INPUT_WORKING_DIRECTORY"] =  workingDir

        const helmfilePath = path.join(workingDir, "helmfile.yaml")
        const helmfileContent = readFileSync(helmfilePath, "utf-8")

        const mockFiles = [
            helmfileContent,
        ]
        require("fs").__setMockFiles(mockFiles)

        const setOutputMock = jest.spyOn(require("@actions/core"), "setOutput")

        require("../helmfileDepCheck").helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "missing")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
})