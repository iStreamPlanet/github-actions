import * as core from "@actions/core"
import * as path from "path"
import { run } from "../main"

const relativeBasePath = "helmfile-dependency-check/__test__/test-data/"
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
        process.env["INPUT_WORKING-DIR"] = path.join(relativeBasePath, "helmfile-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile missing repositories", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(relativeBasePath, "helmfile-no-respository")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile lock fresh", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(relativeBasePath, "helmfile-lock-fresh")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", 4)
    })
    it("helmfile lock stale", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(relativeBasePath, "helmfile-lock-stale")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "stale")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", 370)
    })
    it("helmfile lock missing", async () => {
        process.env["INPUT_WORKING-DIR"] = path.join(relativeBasePath, "helmfile-lock-missing")
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "missing")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
})