const OldROCrate = require("ro-crate").ROCrate;

class ROCrate extends OldROCrate {


  

  arcpId(ns, type, id) {

    if (!id.startsWith('/')) {
      id = `/${id}`;
    }
    return `arcp://name,${ns}/${type}${id}`;
  }
  
  // TODO: Move this to RO-Crate library 
   addProfile(URI) {
    const rootDataset = this.getRootDataset();
    rootDataset.conformsTo = this.utils.asArray(rootDataset.conformsTo);
    rootDataset.conformsTo.push({"@id": URI});
  }

  addProvenance(prov) {
      this.addItem(prov.corpusTool);
      this.addItem(prov.createAction);
  }



  
  
}


  module.exports = ROCrate;
