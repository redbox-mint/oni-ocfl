/* This is part of RO-Crate-language tools 

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

const assert = require("assert");
const Collector = require("./collector.js");
var expect = require('chai').expect;

describe("Can make a Collector object", function() {
  it("Should make a new Collector", function() {
      this.timeout(5000); 
     const corp = new Collector(
         {
             repoPath: "../repo"
         }
     );
     assert.equal(corp.opts.repoPath, "../repo")
    });
});


describe("Can make a schema", function() {
    it("Should make a new Collector", function() {
        this.timeout(5000); 

       const corp = new Collector(
           {
               repoPath: "../repo"
           }
       );
       const obj = corp.newObject();

       // TODO - what to do about multiple formats for csv in one corpus????
       obj.addDialogueSchema({cols: ["#speaker", "#transcript"], "name": "Simple schema"});
       const speakerCol = obj.crate.getItem("#speaker");
       expect(obj.crate.getItem("#speaker").name).to.equal("speaker");

       speakerCol.name = "Speaker";
       expect(obj.crate.getItem("#speaker").name).to.equal("Speaker");
       expect(obj.crate.getItem("#transcript").name).to.equal("transcript");
        
       const obj2 = corp.newObject();
       // TODO - what to do about multiple formats for csv in one corpus????
       // Try with default schema
       obj2.addDialogueSchema();
       expect(obj.crate.getItem("#count").name).to.equal("#");


      });
  });



