import * as core from "@actions/core"
import * as path from "path"
import * as nock from "nock"
import { readFileSync } from "fs"
import { helmfileDepCheck } from "../helmfileDepCheck"

const baseDir = "helmfile-dependency-check/__test__/test-data/"

beforeEach(() => {
    jest.resetModules()

    // index.yaml will be returned for all https GET requests
    const helmfilePath = path.join(baseDir, "index.yaml")
    const helmfileContent = readFileSync(helmfilePath, "utf-8")
    nock(/.*/).persist().get(/.*index.yaml/).reply(200, helmfileContent)
})

afterEach(() => {
    delete process.env["INPUT_WORKING_DIRECTORY"]
})

describe("helmfile-dep-update", () => {
    it("helmfile missing", async () => {
        process.env["INPUT_WORKING_DIRECTORY"] = path.join(baseDir, "helmfile-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
    it("helmfile missing repositories", async () => {
        process.env["INPUT_WORKING_DIRECTORY"] = path.join(baseDir, "helmfile-no-repository")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await helmfileDepCheck()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
    it("helmfile lock fresh", async () => {
        process.env["INPUT_WORKING_DIRECTORY"] = path.join(baseDir, "helmfile-lock-fresh")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
    it("helmfile lock update", async () => {
        process.env["INPUT_WORKING_DIRECTORY"] = path.join(baseDir, "helmfile-lock-update")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await helmfileDepCheck()

        const updateData = {
            name: "datadog",
            repository: "https://helm.datadoghq.com/index.yaml",
            currentVer: "2.4.39",
            latestVer: "2.5.1"
        }
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "update_available")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [updateData])
    })
    it("helmfile lock missing", async () => {
        process.env["INPUT_WORKING_DIRECTORY"] = path.join(baseDir, "helmfile-lock-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await helmfileDepCheck()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "missing")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-updates", [])
    })
})