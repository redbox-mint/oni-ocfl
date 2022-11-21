const assert = require("assert");
const ocfl = require("@ocfl/ocfl-fs");
const {Collector, generateArcpId} = require('../index');
const {ROCrate} = require("ro-crate");
const path = require('path');
const rimraf = require('rimraf');

const basePath = 'test-data/collector_ocfl';
const repoPath = path.join(basePath, 'ocfl');
const namespace = 'collector-test';
const dataDir = path.join(basePath, 'files');
const templateCrateDir = path.join(basePath, 'template');
const title = 'Farms to Freeways Example Dataset';
const titleV2 = 'Farms to Freeways Example Dataset - Im v2!';
const newDescription = 'NEW DESCRIPTION';

let collector;
let corpusCrateRootId;
let repository;

describe("Create OCFL Repo", function () {

  beforeAll(function () {
    rimraf.sync(repoPath);
    console.log(`${repoPath} deleted`);
  })

  it("Should make a new Collector", async function () {
    collector = new Collector({repoPath, namespace, dataDir, templateCrateDir});
    assert.equal(collector.opts.repoPath, repoPath);
  });

  it('can connect', async function () {
    await collector.connect();
    repository = ocfl.storage({root: repoPath, layout: {
        extensionName: '000N-path-direct-storage-layout'
      }});
    await repository.load();
  });

  it('can add V1', async function () {
    const corpusRepo = collector.newObject(collector.templateCrateDir);
    corpusRepo.mintArcpId("corpus");
    const corpusCrate = corpusRepo.crate;
    corpusCrateRootId = generateArcpId(collector.namespace, "corpus");
    corpusCrate.rootId = corpusCrateRootId;
    corpusCrate.rootDataset.name = title;
    await corpusRepo.addToRepo();
  });

  it('can get V1 crate', async function () {
    const object = repository.object(corpusCrateRootId);
    await object.load();
    const crateFile = await object.getFile({logicalPath: 'ro-crate-metadata.json'}).asString();
    const crate = new ROCrate(JSON.parse(crateFile));
    assert(crate.rootDataset.name, title);
  });

  it('can add V2', async function () {
    const corpusRepo = collector.newObject(collector.templateCrateDir);
    corpusRepo.mintArcpId("corpus");
    const corpusCrate = corpusRepo.crate;
    corpusCrateRootId = generateArcpId(collector.namespace, "corpus");
    corpusCrate.rootId = corpusCrateRootId;
    corpusCrate.rootDataset.name = titleV2;
    await corpusRepo.addToRepo();
  });

  it('can get V2 crate', async function () {
    const object = repository.object(corpusCrateRootId);
    await object.load();
    const crateFile = await object.getFile({logicalPath: 'ro-crate-metadata.json'}).asString();
    const crate = new ROCrate(JSON.parse(crateFile));
    assert(crate.rootDataset.name, titleV2);
  });

  it('can add V3 ', async function () {
    const corpusRepo = collector.newObject(collector.templateCrateDir);
    corpusRepo.mintArcpId("corpus");
    const corpusCrate = corpusRepo.crate;
    corpusCrateRootId = generateArcpId(collector.namespace, "corpus");
    corpusCrate.rootId = corpusCrateRootId;
    corpusCrate.rootDataset.name = title;
    await corpusRepo.addToRepo();
  });

  it('can get V3 crate', async function () {
    const object = repository.object(corpusCrateRootId);
    await object.load();
    const crateFile = await object.getFile({logicalPath: 'ro-crate-metadata.json'}).asString();
    const crate = new ROCrate(JSON.parse(crateFile));
    assert(crate.rootDataset.name, title);
  });

  it('can add V4 ', async function () {
    const corpusRepo = collector.newObject(collector.templateCrateDir);
    corpusRepo.mintArcpId("corpus");
    const corpusCrate = corpusRepo.crate;
    corpusCrateRootId = generateArcpId(collector.namespace, "corpus");
    corpusCrate.rootId = corpusCrateRootId;
    corpusCrate.rootDataset.description = newDescription;
    corpusCrate.rootDataset["@type"] = ["Dataset", "RepositoryCollection"];
    await corpusRepo.addToRepo();
  });

  it('can get V4 crate', async function () {
    const object = repository.object(corpusCrateRootId);
    await object.load();
    const crateFile = await object.getFile({logicalPath: 'ro-crate-metadata.json'}).asString();
    const crate = new ROCrate(JSON.parse(crateFile));
    assert(crate.rootDataset.description, newDescription);
  });


});
