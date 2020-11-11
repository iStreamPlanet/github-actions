import * as core from "@actions/core"
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import run from "../main"

beforeEach(() => {
    jest.resetModules()
    const doc = safeLoad(readFileSync(__dirname + "/../action.yml", "utf-8"))
    Object.keys(doc["inputs"]).forEach(name => {
        const envVar = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`
        process.env[envVar] = doc["inputs"][name]["default"]
    })
})

afterEach(() => {
    const doc = safeLoad(readFileSync(__dirname + "/../action.yml", "utf-8"))
    Object.keys(doc["inputs"]).forEach(name => {
        const envVar = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`
        delete process.env[envVar]
    })
})

describe("helmfile-dep-update", () => {
    it("helmfile missing", async () => {
        process.env["INPUT_WORKING-DIR"] = "__test__/test-data/helmfile-missing/"
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile missing repositories", async () => {
        process.env["INPUT_WORKING-DIR"] = "__test__/test-data/helmfile-no-repositories/"
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
    it("helmfile lock fresh", async () => {
        process.env["INPUT_WORKING-DIR"] = "__test__/test-data/helmfile-lock-fresh/"
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "fresh")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", 4)
    })
    it("helmfile lock stale", async () => {
        process.env["INPUT_WORKING-DIR"] = "__test__/test-data/helmfile-lock-stale/"
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()
        
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "stale")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", 370)
    })
    it("helmfile lock missing", async () => {
        process.env["INPUT_WORKING-DIR"] = "__test__/test-data/helmfile-lock-missing/"
        const setOutputMock = jest.spyOn(core, "setOutput")

        await run()

        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-state", "missing")
        expect(setOutputMock).toHaveBeenCalledWith("helmfile-lock-delta", -1)
    })
})