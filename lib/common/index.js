const path = require('path');

exports.workingPath = function workingPath(currentPath) {
    if (path.isAbsolute(currentPath)) {
        return currentPath;
    } else {
        return path.join(process.cwd(), currentPath);
    }
}
