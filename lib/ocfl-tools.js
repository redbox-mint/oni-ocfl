const path = require("path");
const fs = require("fs-extra");
const { Repository: OCFLRepository, OcflObject: OcflObject } = require("ocfl");
const getLogger = require("./common/logger").getLogger;
const hasha = require("hasha");
const assert = require("assert");
const workingPath = require("./common").workingPath;
const ROCrate = require('ro-crate').ROCrate;

const log = getLogger();

async function loadFromOcfl(repoPath) {
  const hashAlgorithm = 'md5';
  const catalogFilename = "ro-crate-metadata.json";
  try {
    const repo = new OCFLRepository();
    repoPath = workingPath(repoPath);
    log.debug(`Loading OCFL: ${repoPath}`);
    await repo.load(repoPath);
    const objects = await repo.objects();
    const records = [];
    for (let object of objects) {
      log.debug(`Loading ocfl object at ${object.path}`);
      //TODO: send optionaly the object not just the path since I already have it. 
      const json = await readCrate({ diskPath: object.path });
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

async function readCrate({ diskPath, version }) {
  const ocflObject = new OcflObject(diskPath);
  const catalogFilename = "ro-crate-metadata.json";
  const inv = await ocflObject.getInventory();
  let state;
  if (!version) {
    state = inv.versions[inv.head].state;
  } else {
    state = inv.versions[version].state;
  }
  for (let hash of Object.keys(state)) {
    if (state[hash].includes(catalogFilename)) {
      const jsonfile = path.join(ocflObject.path, inv.manifest[hash][0]);
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

async function getItem({ diskPath, itemId, version }) {
  const ocflObject = new OcflObject(diskPath);
  const catalogFilename = "ro-crate-metadata.json";
  const inv = await ocflObject.getInventory();
  if (!version) {
    state = inv.versions[inv.head].state;
  } else {
    state = inv.versions[version].state;
  }
  for (let hash of Object.keys(state)) {
    if (state[hash].includes(catalogFilename)) {
      try {
        const filePath = path.join(ocflObject.path, inv.head, 'content', itemId);
        return filePath;
      } catch (e) {
        log.error(`Error reading ${itemId}`);
        log.error(e);
        return new Error(e);
      }
    }
  }
}

async function connectRepo(repoPath) {
  const repo = new OCFLRepository();
  try {
    const stat = await fs.stat(repoPath);
    if (stat.isDirectory()) {
      await repo.load(repoPath);
      return repo;
    } else {
      log.error(`${repoPath} is not a directory`);
    }
  } catch (e) {
    await fs.mkdir(repoPath);
    await repo.create(repoPath);
    return repo;
  }
}

async function checkin({ repo, rocrateDir, crate }) {
  const hashAlgorithm = 'md5';
  try {
    const existingId = crate.getRootId();
    //TODO: validate existingId.
    assert(existingId !== "./", "Id should be in arcpId format");
    log.debug(`repo: ${repo.path}, ${existingId}`);
    const hasDir = hasha(existingId, { algorithm: hashAlgorithm });
    const res = await repo.importNewObjectDir(hasDir, rocrateDir);
    log.debug(`Updated ${existingId}, ${res.path}`);
    return res.path;
  } catch (e) {
    log.error(`Error checking in ${rocrateDir}`);
    log.error(e);
  }
}

// TODO: Define a standard on what to do in case there is no Identifier.
// Like `arcp://name,sydney-speaks/corpus/${type}${id}`;
function arcpId({ crate, identifier, setIdentifier }) {
  try {
    const id = crate.getNamedIdentifier(identifier);
    if (!id) {
      let url;
      if (setIdentifier) {
        url = new URL(`arcp://name,${identifier}`);
      } else {
        const fallBackId = crate.getNamedIdentifier('domain');
        assert(fallBackId, 'No fallback identifier found, looking for: domain...');
        url = new URL(fallBackId, `arcp://name,${identifier}`);
      }
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

async function loadCollection({ repo, ocfl, col, setIdentifier }) {
  try {
    const jsonld = fs.readJsonSync(col.roCrateDir + "/" + col.roCrate);
    const crate = new ROCrate(jsonld);
    crate.index();
    log.debug(`Check-in: ${col.title}`);
    await checkin(repo, ocfl.create.repoName, col.roCrateDir, crate, ocfl.hashAlgorithm, setIdentifier);
  } catch (e) {
    log.error('error: loadCollection');
    throw new Error(e);
  }
}

async function createRepo({ configuration }) {
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
        await loadCollection({ repo, ocfl, col });
      }
    }
    log.debug("Finished loading collections");
  } catch (e) {
    log.error('error: createRepo');
    throw new Error(e);
  }
}

module.exports = {
  loadFromOcfl,
  readCrate,
  getItem,
  connectRepo,
  checkin,
  arcpId,
  loadCollection,
  createRepo
}
