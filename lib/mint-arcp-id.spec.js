const assert = require("assert");
const generateArcpId = require("./mint-arcp-id");

const namespace = 'collector-test';

describe("Generate some kinds of arcps", function () {

  it("Should make an arcpid only with a namespace", async function () {
    const paths = undefined;
    const arcpId = generateArcpId(namespace, paths);
    assert.equal(`arcp://name,collector-test`, arcpId);
  });

  it("Should make an arcpid with backwards compatibility no id", async function () {
    const paths = 'some';
    const arcpId = generateArcpId(namespace, paths);
    assert.equal(`arcp://name,collector-test/some`, arcpId);
  });

  it("Should make an arcpid with backwards compatibility", async function () {
    const paths = 'some';
    const id = 'item-id'
    const arcpId = generateArcpId(namespace, paths, id);
    assert.equal(`arcp://name,collector-test/some/item-id`, arcpId);
  });

  it("Should make an arcpid with array of paths and backwards compatibility", async function () {
    const paths = ['some', 'nested'];
    const id = 'item-id'
    const arcpId = generateArcpId(namespace, paths, id);
    assert.equal(`arcp://name,collector-test/some/nested/item-id`, arcpId);
  });

  it("Should error with no namespace", async function () {
    assert.throws(function () {
      generateArcpId();
    }, 'no namespace provided');
  });

});
