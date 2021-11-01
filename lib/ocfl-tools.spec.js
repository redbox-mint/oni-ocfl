const fs = require("fs-extra");
const path = require("path");

const ROCrate = require("ro-crate").ROCrate;
const ocfl = require("ocfl");

const oniOcfl = require("./ocfl-tools");
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
        const repo = await oniOcfl.connectRepo(testOCFL.ocflPath);
        const jsonld = fs.readJsonSync(testFarmsToFreeways.roCrateDir + "/" + testFarmsToFreeways.roCrate);
        const crate = new ROCrate(jsonld);
        crate.index();
        await oniOcfl.checkin(repo, 'ATAP', testFarmsToFreeways.roCrateDir, crate, testOCFL.hashAlgorithm, testOCFL.catalogFilename)
    })
    it("it should load the ocfl repo", async () => {
        records = await oniOcfl.loadFromOcfl(testOCFL.ocflPath, testOCFL.catalogFilename, testOCFL.hashAlgorithm);
        expect(records.length).toBeGreaterThanOrEqual(1);
    });
    it("It should load ocflobjects", () => {
        expect(records[0]['ocflObject']).not.toBeNull()
    });
    it("It should load an ro-crate", () => {
        const jsonld = records[0]['jsonld'];
        crate = new ROCrate(jsonld);
        crate.index();
        const root = crate.getRootDataset();
        expect(root).not.toBe(undefined);
    });
    it("Should get an item", async () => {
        const id = 'arcp://name,ATAP/uts.edu.au';
        const itemId = 'files/165/original_2e21ee2bdb706deca25326c1128d745c.jpg';
        
        const diskPath = path.join(testOCFL.ocflPath, records[0]['path'])
        const ocflObject = new ocfl.OcflObject(diskPath);
        const filePath = await oniOcfl.getItem(ocflObject, testOCFL.catalogFilename, itemId);
        expect(filePath).toBe(`${diskPath}/v1/content/${itemId}`);
    })
});
