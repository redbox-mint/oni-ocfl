function generateArcpId(ns, paths = [], id) {
  if (!ns) {
    throw new Error('No namespace provided')
  } else {
    if (Array.isArray(paths)) {
      if (id) {
        paths.push(id)
      }
    }
    if (typeof paths === 'string') {
      paths = [paths];
      if (id) {
        paths.push(id);
      }
    }
    if (paths.length > 0) {
      let path = [].concat(...paths).join('/');
      return `arcp://name,${ns}/${path}`;
    } else {
      return `arcp://name,${ns}`;
    }
  }
}

module.exports = generateArcpId;
