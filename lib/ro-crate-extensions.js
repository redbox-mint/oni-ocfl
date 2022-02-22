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
    const metadataDescriptor = this.getItem("ro-crate-metadata.json");
    metadataDescriptor.conformsTo = this.utils.asArray(metadataDescriptor.conformsTo)
    metadataDescriptor.conformsTo.push({"@id": URI});
  }

  addProvenance(prov) {
      this.addItem(prov.corpusTool);
      this.addItem(prov.createAction);
  }



  
  
}


  module.exports = ROCrate;