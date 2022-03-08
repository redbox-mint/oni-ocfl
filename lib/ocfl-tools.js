const fs = require("fs-extra");
const { Repository } = require('@coedl/ocfl');
const getLogger = require("./common/logger").getLogger;
const assert = require("assert");
const ROCrate = require('ro-crate').ROCrate;

const log = getLogger();

/** Create to repo if not exists, forcing creating of scratch dir
 * @param {string} ocflRoot - ocflRoot dir.
 * @param {string} ocflScratch - ocflScratch dir.
 * */
async function createRepo({ ocflRoot, ocflScratch }) {
  // Creates a repository if the folder does not exist
  assert(!await fs.pathExists(ocflRoot), 'Folder already exists, will not create repostiory');
  if (!await fs.pathExists(ocflRoot)) {
    await fs.mkdirp(ocflRoot);
  }
  if (!await fs.pathExists(ocflScratch)) {
    await fs.mkdirp(ocflScratch);
  }
  const repository = new Repository({ ocflRoot, ocflScratch });
  await repository.create();
  return repository;
}

/** Connect to repo if exists, forcing creating of scratch dir if not exists
 * @param {string} ocflRoot - ocflRoot dir.
 * @param {string} ocflScratch - ocflScratch dir.
 * */
async function connectRepo({ ocflRoot, ocflScratch }) {
  // Connects to an already existing repository
  try {
    assert(await fs.pathExists(ocflRoot), `path: ${ocflRoot} : does not exist cannot connect`);
    if (await !fs.pathExists(ocflScratch)) {
      await fs.mkdirp(ocflScratch);
    }
    const repository = new Repository({ ocflRoot, ocflScratch });
    assert(await repository.isRepository(), 'Cannot connect, not an ocfl repository');
    return repository;
  } catch (e) {
    console.error('error: connectRepo');
    throw new Error(e);
  }
}

/** Checkin directory, creates an object in the repository
 * @param {Repository} repository - Repo with objects.
 * @param {string} rocrateDir - Object dir.
 * @param {ROCrate} crate - ROCrate to get id.
 * */
async function checkin({ repository, rocrateDir, crate }) {
  try {
    const existingId = crate.getRootId();
    //TODO: validate existingId.
    assert(existingId !== "./", "Id should be in arcpId format");
    let object = repository.object({ id: existingId });
    await object.update({ source: rocrateDir, updateMode: 'merge' });
    return object;
  } catch (e) {
    console.log(`Error doing check in for: ${rocrateDir}`);
    throw new Error(e);
  }
}

/** Get File Info 
 * @param {Repository} repository - Repo with objects.
 * @param {string} crateId - Object Id.
 * @param {string} version - Optional Version.
 * @param {string} filePath - File path to get from the state.
 * */
async function getFileInfo({ repository, crateId, version, filePath }) {
  let itemVersion;
  try {
    const object = repository.object({ id: crateId });
    await object.load();

    if (!version) {
      itemVersion = await object.getLatestVersion();
    } else {
      itemVersion = await object.getVersion({ version });
    }
    let file = itemVersion.state[filePath].pop();
    const relPath = object.resolveFilePath({ filePath: file.path });
    return {
      path: relPath,
      pairTreeId: object.pairtreeId,
      version: itemVersion.version
    };
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

/** Get File Info 
 * @param {ROCrate} crate - crate.
 * @param {string} identifier - identifier Id.
 * @param {boolean} setIdentifier - force setting identifier, if not fallback with domain identifier.
 * */
function arcpId({ crate, identifier, setIdentifier }) {
  // TODO: Define a standard on what to do in case there is no Identifier.
  // Like `arcp://name,sydney-speaks/corpus/${type}${id}`;
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
    console.error(e);
    throw new Error(e);
  }
}

module.exports = {
  createRepo,
  connectRepo,
  checkin,
  getFileInfo,
  arcpId
}
