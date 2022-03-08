const OldROCrate = require("ro-crate").ROCrate;

class ROCrate extends OldROCrate {
  arcpId(ns, type, id) {
    if (!id.startsWith('/')) {
      id = `/${id}`;
    }
    return `arcp://name,${ns}/${type}${id}`;
  }
/**
 * addProfile
 * Adds conformsTo to the root of the crate
 * @param {any} URI 
 * @todo Move this to RO-Crate library 
 */
  addProfile(URI) {
    const rootDataset = this.getRootDataset();
    rootDataset.conformsTo = this.utils.asArray(rootDataset.conformsTo);
    rootDataset.conformsTo.push({ "@id": URI });
  }

  addProvenance(prov) {
    this.addItem(prov.corpusTool);
    this.addItem(prov.createAction);
  }

}

module.exports = ROCrate;
