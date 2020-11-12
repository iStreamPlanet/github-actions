import * as core from "@actions/core"
import * as path from "path"
import { run } from "../helmfileDepCheck"

const baseDir = "helmfile-dependency-check/__test__/test-data/"

beforeEach(() => {
    jest.resetModules()
    process.env["INPUT_DAYS-STALE"] = "30"
})

afterEach(() => {
    delete process.env["INPUT_WORKING-DIR"]
    delete process.env["INPUT_DAYS-STALE"]
})

describe("helmfile-dep-update", () => {
    it("helmfile missing", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(baseDir, "helmfile-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile missing repositories", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(baseDir, "helmfile-no-repository")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile lock fresh", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(baseDir, "helmfile-lock-fresh")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalled()
    })
    it("helmfile lock stale", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(baseDir, "helmfile-lock-stale")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "stale")
        expect(setOutputMock).toHaveBeenCalled()
    })
    it("helmfile lock missing", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(baseDir, "helmfile-lock-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "missing")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
})