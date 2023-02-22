

function generateArcpId(ns, type, id) {
    if (!id.startsWith('/')) {
        id = `/${id}`;
    }
    return `arcp://name,${ns}/${type}${id}`;
}

module.exports = generateArcpId;
