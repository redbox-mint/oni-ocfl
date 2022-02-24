const fs = require("fs-extra");
const path = require("path");

const ROCrate = require("ro-crate").ROCrate;

const { ocfltools } = require("../index");
const testOCFL = require('./common/test-utils').testOCFL;
const testFarmsToFreeways = require('./common/test-utils').testFarmsToFreeways;

let records;
let crate;

jest.setTimeout(10000);

function cleanup() {
  const ocflPath = path.join(process.cwd(), testOCFL.ocflPath);
  if (fs.pathExistsSync(ocflPath)) {
    fs.removeSync(ocflPath);
  }
}

describe("Test Create OCFL repo", () => {

  beforeAll(() => {
    cleanup();
  });

  it("create repo", async () => {
    const repo = await ocfltools.connectRepo(testOCFL.ocflPath);
    const jsonld = fs.readJsonSync(testFarmsToFreeways.roCrateDir + "/" + testFarmsToFreeways.roCrate);
    const crate = new ROCrate(jsonld);
    crate.toGraph();
    const res = await ocfltools.checkin({ repo, rocrateDir: testFarmsToFreeways.roCrateDir, crate });
    expect(res).not.toBe(undefined);
  })
  it("it should load the ocfl repo", async () => {
    records = await ocfltools.loadFromOcfl(testOCFL.ocflPath);
    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records[0]['ocflObject']).not.toBeNull()
  });
  it("It should load an ro-crate", () => {
    const jsonld = records[0]['jsonld'];
    crate = new ROCrate(jsonld);
    crate.toGraph();
    const root = crate.getRootDataset();
    expect(root).not.toBe(undefined);
  });
  it("Should get an item", async () => {
    const itemId = 'files/165/original_2e21ee2bdb706deca25326c1128d745c.jpg';
    const diskPath = path.join(testOCFL.ocflPath, records[0]['path'])
    const filePath = await ocfltools.getItem({ diskPath, itemId });
    expect(filePath).toBe(`${diskPath}/v1/content/${itemId}`);
  });
  it("Should read a crate with an identifier", async () => {
    const id = 'arcp://name,farms-to-freeways/corpus/root';
    const diskPath = path.join(testOCFL.ocflPath, records[0]['path'])
    const json = await ocfltools.readCrate({diskPath});
    const crate = new ROCrate(json);
    crate.toGraph();
    const identifier = crate.getRootId();
    expect(identifier).toBe(id);
  });
});
