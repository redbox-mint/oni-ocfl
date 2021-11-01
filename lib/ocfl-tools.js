const path = require("path");
const fs = require("fs-extra");
const OCFLRepository = require("ocfl").Repository;
const getLogger = require("./common/logger").getLogger;
const hasha = require("hasha");
const workingPath = require("./common").workingPath;
const ROCrate = require('ro-crate').ROCrate;

const log = getLogger();

exports.loadFromOcfl = async function loadFromOcfl(repoPath, catalogFilename, hashAlgorithm) {
  try {
    const repo = new OCFLRepository();
    repoPath = workingPath(repoPath);
    log.debug(`Loading OCFL: ${repoPath}`);
    await repo.load(repoPath);
    const objects = await repo.objects();
    const records = [];
    for (let object of objects) {
      log.debug(`Loading ocfl object at ${object.path}`);
      const json = await this.readCrate(object, catalogFilename);
      if (json) {
        records.push({
          path: path.relative(repoPath, object.path),
          hash_path: hasha(object.path, { algorithm: hashAlgorithm }),
          jsonld: json,
          ocflObject: object
        });
      } else {
        log.warn(`Couldn't find ${catalogFilename} in OCFL inventory for ${object.path}`);
      }
    }
    log.debug(`got ${records.length} records`);

    return records;
  } catch (e) {
    log.error('loadFromOcfl error');
    log.error(e);
  }
}

// look for the ro-crate metadata file in the ocfl object's
// inventory, and if found, try to load and parse it.
// if it's not found, returns undefined

exports.readCrate = async function readCrate(object, catalogFilename) {

  const inv = await object.getInventory();
  const headState = inv.versions[inv.head].state;

  for (let hash of Object.keys(headState)) {
    if (headState[hash].includes(catalogFilename)) {
      const jsonfile = path.join(object.path, inv.manifest[hash][0]);
      try {
        const json = await fs.readJson(jsonfile);
        return json;
      } catch (e) {
        log.error(`Error reading ${jsonfile}`);
        log.error(e);
        return undefined;
      }
    }
  }
  return undefined;
}

exports.getItem = async function getItem(object, catalogFilename, itemId) {
  const inv = await object.getInventory();
  const headState = inv.versions[inv.head].state;
  for (let hash of Object.keys(headState)) {
    if (headState[hash].includes(catalogFilename)) {
      try {
        const filePath = path.join(object.path, inv.head, 'content', itemId);
        return filePath;
      } catch (e) {
        log.error(`Error reading ${itemId}`);
        log.error(e);
        return new Error(e);
      }
    }
  }
}

exports.connectRepo = async function connectRepo(repoPath) {
  const repo = new OCFLRepository();
  try {
    const stat = await fs.stat(repoPath);
    if (stat.isDirectory()) {
      await repo.load(repoPath);
      return repo;
    } else {
      console.error(`${repoPath} is not a directory`);
    }
  } catch (e) {
    await fs.mkdir(repoPath);
    await repo.create(repoPath);
    return repo;
  }
}

exports.checkin = async function checkin(repo, repoName, rocrateDir, crate, hashAlgorithm, catalogFilename) {
  const rocrateFile = path.join(rocrateDir, catalogFilename);
  try {
    const existingId = crate.getNamedIdentifier(repoName);
    log.debug(`repoName: ${repoName}, ${existingId}`);
    if (existingId) {
      log.debug(`Local identifier found ${repoName}/${existingId}`);
      const hasDir = hasha(existingId, { algorithm: hashAlgorithm });
      const res = await repo.importNewObjectDir(hasDir, rocrateDir);
      log.debug(`Updated ${existingId}, ${res.path}`);
    } else {
      const newId = arcpId({ crate, identifier: repoName });
      log.debug(`Minting new local identifier ${repoName}/${newId}`);
      await repo.importNewObjectDir(newId, rocrateDir);
      log.debug(`Imported ${rocrateDir}  ${newId}`);
      crate.addIdentifier({ name: repoName, identifier: newId });
      await fs.writeJson(rocrateFile, crate.getJson(), { spaces: 2 });
      const hasDir = hasha(newId, { algorithm: hashAlgorithm });
      const res = await repo.importNewObjectDir(hasDir, rocrateDir);
      log.debug(`Updated ${rocrateDir} ${newId} metadata with identifier - wrote to ${res}`);
    }
  } catch (e) {
    log.error(`Error importing ${rocrateDir}`);
    log.error(e);
  }

}

// TODO: Define a standard on what to do in case there is no Identifier.
// Like `arcp://name,sydney-speaks/corpus/${type}${id}`;
exports.arcpId = function arcpId({ crate, identifier }) {
  try {
    const id = crate.getNamedIdentifier(identifier);
    if (!id) {
      const fallBackId = crate.getNamedIdentifier('domain');
      if (!fallBackId) {
        log.warn(`No identifier found ${identifier}... skipping`);
        return null;
      }
      const url = new URL(fallBackId, `arcp://name,${identifier}`);
      return url.href;
    } else {
      const url = new URL(id, `arcp://name,`);
      return url.href;
    }
  } catch (e) {
    log.error(`arcpId error`);
    log.error(e);
  }
}

exports.loadCollection = async function loadCollection({repo, ocfl, col}) {
  try {
    const jsonld = fs.readJsonSync(col.roCrateDir + "/" + col.roCrate);
    const crate = new ROCrate(jsonld);
    crate.index();
    console.log(`Check-in: ${col.title}`);
    await checkin(repo, ocfl.create.repoName, col.roCrateDir, crate, ocfl.hashAlgorithm);
  } catch (e) {
    console.log('error: loadCollection');
    throw new Error(e);
  }
}

exports.createRepo = async function createRepo({configuration}) {
  try {
    const ocfl = configuration.api.ocfl;
    const ocflPath = workingPath(ocfl.ocflPath);
    if (fs.pathExistsSync(ocflPath)) {
      fs.removeSync(ocflPath);
    }
    const repo = await connectRepo(ocflPath);
    const collections = await fs.readJson(ocfl.create.collections);
    for (let col of collections) {
      if (!col.skip) {
        await loadCollection({repo, ocfl, col});
      }
    }
    console.log("Finished loading collections");
  } catch (e) {
    console.log('error: createRepo');
    throw new Error(e);
  }
}
