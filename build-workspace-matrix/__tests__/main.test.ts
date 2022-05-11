import { changedFiles } from "../changedFiles";
import { getWorkspaces } from "../main";
import { promises as fs, existsSync } from "fs";
import * as path from "path";

jest.mock("../changedFiles");

const folders = [
  "clusters/stream-a",
  "clusters/stream-b",
  "clusters/stream-c",
  "clusters/origin-a",
  "clusters/origin-b",
  "clusters/broadcast",
  "clusters/modules/stream",
  "clusters/modules/origin-and-stream",
  "clusters/modules/origin",
  "clusters/modules/global",
];

const shared = {
  dispatchWorkspace: "clusters/origin-a",
  githubToken: "token",
  workspaceGlobs: `
# a comment
clusters/*/
# the below is excluded
!clusters/modules/`,
  workspaceDependencyGlobPatterns: `
# a comment
clusters/stream-*/ : clusters/modules/stream/**/*.txt
clusters/stream-*/ : clusters/modules/origin-and-stream/**/*.txt
clusters/origin-*/ : clusters/modules/origin/**/*.txt
clusters/origin-*/ : clusters/modules/origin-and-stream/**/*.txt
`,
  globalDependencyGlobs: `
# a comment
clusters/modules/global/**/*.txt
`,
}
let wd: string;

beforeAll(async () => {
  wd = process.cwd();
  process.chdir(__dirname);
  const folder = path.join(__dirname, "clusters");
  if (existsSync(folder)) {
    await fs.rmdir(folder, { recursive: true });
  }
  for (const f of folders) {
    const folder = path.join(__dirname, f);
    await fs.mkdir(folder, { recursive: true });
  }
})

afterAll(async () => {
  process.chdir(wd);
  await fs.rmdir(path.join(__dirname, "clusters"), { recursive: true });
})

test("getWorkspaces event:workflow_dispatch returns dispatch workspace", async () => {
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "workflow_dispatch",
  });
  expect(workspaces).toEqual(["clusters/origin-a"]);
});

test("getWorkspaces event:schedule returns all workspaces", async () => {
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "schedule",
  });
  expect(workspaces.sort()).toEqual([
    "clusters/stream-a",
    "clusters/stream-b",
    "clusters/stream-c",
    "clusters/origin-a",
    "clusters/origin-b",
    "clusters/broadcast",
  ].sort());
});

test("getWorkspaces event:push/pull_request returns workspaces with changes", async () => {
  const mockedChangedFiles = jest.mocked(changedFiles);
  mockedChangedFiles.mockResolvedValue([
    "clusters/stream-a/file.txt",
    "clusters/origin-b/file.txt",
  ])
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "push",
  });
  expect(workspaces.sort()).toEqual([
    "clusters/stream-a",
    "clusters/origin-b",
  ].sort());
});

test("getWorkspaces event:push/pull_request returns all workspaces when global dependency has change", async () => {
  const mockedChangedFiles = jest.mocked(changedFiles);
  mockedChangedFiles.mockResolvedValue([
    "clusters/modules/global/subdir/file.txt",
  ])
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "push",
  });
  expect(workspaces.sort()).toEqual([
    "clusters/broadcast",
    "clusters/origin-a",
    "clusters/origin-b",
    "clusters/stream-a",
    "clusters/stream-b",
    "clusters/stream-c",
  ].sort());
});

test("getWorkspaces event:push/pull_request returns no workspaces when global dependency has change to unmatched files", async () => {
  const mockedChangedFiles = jest.mocked(changedFiles);
  mockedChangedFiles.mockResolvedValue([
    "clusters/modules/global/subdir/file.wrong_extension",
  ])
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "push",
  });
  expect(workspaces.sort()).toEqual([].sort());
});

test("getWorkspaces event:push/pull_request returns workspaces when dependency changes", async () => {
  const mockedChangedFiles = jest.mocked(changedFiles);
  mockedChangedFiles.mockResolvedValue([
    "clusters/modules/stream/subdir/file.txt",
  ])
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "push",
  });
  expect(workspaces.sort()).toEqual([
    "clusters/stream-a",
    "clusters/stream-b",
    "clusters/stream-c",
  ].sort());
});

test("getWorkspaces event:push/pull_request returns workspaces when shared dependency changes", async () => {
  const mockedChangedFiles = jest.mocked(changedFiles);
  mockedChangedFiles.mockResolvedValue([
    "clusters/modules/origin-and-stream/subdir/file.txt",
  ])
  const workspaces = await getWorkspaces({
    ...shared,
    eventName: "push",
  });
  expect(workspaces.sort()).toEqual([
    "clusters/origin-a",
    "clusters/origin-b",
    "clusters/stream-a",
    "clusters/stream-b",
    "clusters/stream-c",
  ].sort());
});
