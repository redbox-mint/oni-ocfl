const fs = require("fs-extra");
const path = require("path");

const ROCrate = require("ro-crate").ROCrate;

const { ocfltools } = require("../index");
const testOCFL = require('./common/test-utils').testOCFL;
const testFarmsToFreeways = require('./common/test-utils').testFarmsToFreeways;

let objects;
let repository;

const ocflRoot = path.join(process.cwd(), testOCFL.ocflPath);
const ocflScratch = path.join(process.cwd(), testOCFL.ocflScratch);
const filePath = 'files/165/original_2e21ee2bdb706deca25326c1128d745c.jpg';
const crateId = 'arcp://name,farms-to-freeways/corpus/root';

jest.setTimeout(100000);

function cleanup() {
  if (fs.pathExistsSync(ocflRoot)) {
    fs.removeSync(ocflRoot);
  }
  if (fs.pathExistsSync(ocflScratch)) {
    fs.removeSync(ocflScratch);
  }
}

describe("Test Create OCFL repo", () => {

  beforeAll(() => {
    cleanup();
  });

  it("create repo", async () => {
    repository = await ocfltools.createRepo({ ocflRoot, ocflScratch });
    const jsonld = fs.readJsonSync(testFarmsToFreeways.roCrateDir + "/" + testFarmsToFreeways.roCrate);
    const crate = new ROCrate(jsonld);
    crate.toGraph();
    const object = await ocfltools.checkin({ repository, rocrateDir: testFarmsToFreeways.roCrateDir, crate });
    const isObject = await object.isObject()
    expect(isObject);
  });
  it('it should connect to the repo', async () => {
    repository = await ocfltools.connectRepo({ ocflRoot, ocflScratch });
    expect(await repository.isRepository());
  });
  it("it should load the ocfl repo", async () => {
    repository.findObjects();
    objects = [];
    repository.on("object", object => {
      objects.push(object);
    });
    setTimeout(() => {
      expect(objects.length).toEqual(1);
    }, 300);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("Should get a filepath with an object", async () => {
    const fileInfo = await ocfltools.getFileInfo({ repository, crateId, version: 'v1', filePath });
    const actualPath = path.join(ocflRoot, objects[0]['objectPath'], '/v1/content/', filePath);
    expect(fileInfo.path).toEqual(actualPath);
  });
  it("Should read a crate with an identifier", async () => {
    const jsonInfo = await ocfltools.getFileInfo({ repository, crateId, filePath: 'ro-crate-metadata.json' });
    const json = await fs.readJSON(jsonInfo.path)
    const crate = new ROCrate(json);
    crate.toGraph();
    const identifier = crate.getRootId();
    expect(identifier).toBe(crateId);
  });
});
