

function generateArcpId(ns, id) {
    if (!id.startsWith('/')) {
        id = `/${id}`;
    }
    return `arcp://name,${ns}/${id}`;
}

module.exports = generateArcpId;
