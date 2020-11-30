const child_process = jest.createMockFromModule("child_process")

function execSync(command: string): Buffer {
    const buffer = Buffer.from(`executed: ${command}`)
    return buffer
}

(child_process as any).execSync = execSync

module.exports = child_process