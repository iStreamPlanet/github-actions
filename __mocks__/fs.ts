const fs = jest.genMockFromModule("fs");

let mockFiles: string[] | null = null;

function __setMockFiles(newMockFiles: string[]): void {
    mockFiles = newMockFiles
}

function readFileSync(path: string, encoding: string): string {
    if (mockFiles.length === 0) {
        return "" 
    }
    return mockFiles.shift()
}

function existsSync(path: string): boolean {
    if (RegExp(/helmfile-missing\/helmfile\.yaml/).exec(path)) {
        return false
    } else if (RegExp(/helmfile-lock-missing\/helmfile\.lock/).exec(path)) {
        return false
    }
    return true
}

(fs as any).__setMockFiles = __setMockFiles;
(fs as any).readFileSync = readFileSync;
(fs as any).existsSync = existsSync;

module.exports = fs;