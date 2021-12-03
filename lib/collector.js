/* This is part of oni-ocfl

(c) The University of Queensland 2021

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* Test for collection.js */
const path = require("path");
const fs = require("fs-extra");
const Provenance = require("./provenance.js");
const getLogger = require("./common/logger").getLogger;
const workingPath = require("./common").workingPath;
const ROCrate = require("./ro-crate-extensions");
const {program} = require('commander');
const { connectRepo, checkin } = require("./ocfl-tools.js");
const mintArcpId = require("./mint-arcp-id");
const tmp = require("tmp");
const _ = require("lodash");


const SCHEMA_TEMPLATE = {
  "@id": "#OrthographicTranscriptionCSVSchema",
  "@type": "csvw:Schema",
  "columns": [
   
  ],
  "name": "Schema for ..."
}

const DIALOGUE_SCHEMA_COLUMNS = {
  "#speaker": {
    "@id": "#speaker",
    "@type": "csvw:Column",
    "csvw:datatype": "string",
    "description": "Which of the participants is talking in that particular utterance. ",
    "name": "speaker"
  },
  "#start_time": {
    "@id": "#start_time",
    "@type": "csvw:Column",
    "csvw:datatype": "",
    "description": "Start time of the utterance.",
    "name": "Start_time",
    "sameAs": {"@id": "https://schema.org/startTime"}
  },
  "#stop_time" : {
    "@id": "#stop_time",
    "@type": "csvw:Column",
    "csvw:datatype": "",
    "description": "End time of the utterance.",
    "name": "stop_time",
    "sameAs": {"@id": "https://schema.org/endTime"}
  },
  "#count" : {
    "@id": "#count",
    "@type": "csvw:Column",
    "csvw:datatype": "",
    "description": "Utterance number",
    "name": "#",
  },
  "#transcript" : {
    "@id": "#transcript",
    "@type": "csvw:Column",
    "csvw:datatype": "",
    "description": "Transcription of speaker turn",
    "name": "transcript",
    "sameAs": {"@id": "http://www.language-archives.org/REC/type-20020628.html#transcription/orthographic"}
  },
  "#notes" : {
    "@id": "#notes",
    "@type": "csvw:Column",
    "csvw:datatype": "",
    "description": "Addintional information",
    "name": "notes",
  }

}



  // OCFLObject
  class CollectionObject {
    constructor(parent, crateDir){
        this.collector = parent; 
        if (crateDir) {
          // Load the RO-Crate from the specified directory
          const metaPath = path.join(crateDir, "ro-crate-metadata.json");
          const json = JSON.parse(fs.readFileSync(metaPath));
          this.crate = new ROCrate(json);

        } else {
          this.crate = new ROCrate();
        }
        this.crate.index();
        this.rootDataset = this.crate.getRootDataset();
        this.rootDataset.hasPart = [];
        this.rootDataset.hasMember = [];
        this.__tmpobj = tmp.dirSync({tmpdir: parent.tempDirPath});
        this.dir = this.__tmpobj.name;

        // Make a temp directory    
    }


    addDialogueSchema(opts) {
      /* Opts 
        name: A name for the schema
        id: An ID for this schema
        columns: An array of columns (see DIALOGUE_SCHEMA_COLUMNS for a complete set)

      */

       // TODO - what to do about multiple formats for csv in one corpus????
      opts = opts || {};
      const schema = _.cloneDeep(SCHEMA_TEMPLATE);
      schema["@id"] = opts.id || "#dialog_schema";
      schema["name"] = opts.name || "Table schema for dialogue transcript";
      //csv["csvw:tableSchema"] = {"@id": schema["@id"]};
      opts.columns = opts.columns || Object.keys(DIALOGUE_SCHEMA_COLUMNS);
      this.crate.addItem(schema);
      for (let col of opts.columns) {
        schema.columns.push({"@id": col});
        const column = DIALOGUE_SCHEMA_COLUMNS[col];
        if (!column)  {
          throw `No column ${col} in inbuilt schema`
        }
        this.crate.addItem(column);
      }
      this.__dialogueSchemaId = schema["@id"];
    }
    linkDialogueSchema(f) {
      f["csvw:tableSchema"] = {"@id": this.__dialogueSchemaId};

    }



    mintArcpId(type, id) {
        this.id = mintArcpId(this.collector.namespace, type, id);
    }

    // Copy a file into an objects temp directory and add it to the crate
    async addFile(f, srcPath) {
          // File should be JSCON
          //f: IS a JSON-LD item
          // subDir is an optional directory under the colllectorDataDir
          this.rootDataset.hasPart.push({"@id": f["@id"]});
          this.crate.addItem(f);
          srcPath = srcPath || path.join(this.collector.dataDir, f["@id"])
          const destPath = path.join(this.dir, f["@id"]);
          
          if (fs.existsSync(srcPath)) {
            await fs.ensureFile(destPath);
            f.size = (await fs.stat(srcPath)).size;
            await fs.copyFile(srcPath, destPath);
            //console.log("Copied", srcPath, destPath);
          } else {
            console.error(`File: ${srcPath} missing`);
          }   
    }

    async addToRepo() {
        // Write the object into the actual OCFL repo
        const rocrateFile = path.join(this.dir, "ro-crate-metadata.json");
        this.crate.addIdentifier({name: this.collector.repoName, identifier: this.id});
        this.crate.addProvenance(this.collector.prov);
        await fs.writeFileSync(rocrateFile, JSON.stringify(this.crate.getJson(), null, 2));
        const resp =  await checkin(this.collector.repo, this.collector.repoName, this.dir, this.crate, "md5", "ro-crate-metadata.json");
        console.log(`Wrote crate ${resp}`);
        console.log(`Deleting crateDir: ${this.dir}`);
        fs.rmSync(this.dir, { recursive: true, force: true });
    }

  }
  
  function getOpts(extaOpts) {
    // extraOpts TODO: Array of arrays with extra .options (see below)
        program.option('-r, --repo-path <type>', 'Path to OCFL repository')
        .option('-n, --repo-name <type>', 'Name of OCFL repository')
        .option('-s, --namespace <ns>', 'namespace for ARCP IDs')
        .option('-c, --corpus-name <ns>', 'Name of this corpus/collection (if not in template)')
        .option('-x --excel <file>', 'Excel file')
        .option('-p --temp-path <dirs>', 'Temporary Directory Path')
        .option('-t, --template <dirs>', 'RO-Crate directory on which to base this the RO-Crate metadata file will be used as a base and any files copied in to the new collection crate')
        .option('-d --data-dir <dirs>', "Directory of data files with sub directories '/Sound files' (for .wav) and '/Transcripts' (.csv)")
        program.parse(process.argv);
        return program.opts();
}
  // Collector is a class for use in building (or adding to) an OCFL repo for a collection of data (eg a linguistic Collector)
  class Collector {
      constructor(opts) {
          // For testing, pass opts
          if (opts) {
              // We have 'normal' options being passed
              this.opts = opts;
          } else {
              // Get from commandline - TODO - pass more opts
              this.opts = getOpts(opts);
          }
             
          this.excelPath = this.opts.excel;
          this.tempDirPath = this.opts.tempPath || './temp';
          this.repoPath = this.opts.repoPath || "../repo";
          this.repoName = this.opts.repoName || "repository";
          this.templateCrateDir = this.opts.template;
          this.dataDir = this.opts.dataDir;
          this.excelFile = this.opts.excel;
          this.namespace = this.opts.namespace; // eg "sydney-speaks" or "monash-Collector-of-english"
          this.CollectorName = this.opts.CollectorName;
          // This is slow so do it now
          this.prov = new Provenance();
    
      }
      async connect() {
        this.repo = await connectRepo(this.repoPath);
      }

      newObject(cratePath) {
          return new CollectionObject(this, cratePath);

      }
      

      
  }
  
  
  module.exports = Collector;