var errors = require('lo/errors');
var node_path = require('node:path');

class WalkError extends errors.BaseError {
    static code = 'ERR_WALK';
}

class FileError extends Error {
    static code = 'ERR_FILE';
}

function stripTrailingSep (str='') {
    return node_path.normalize(str).replace(/[\\/]+$/, '');
}

Object.defineProperty(exports, "NotFoundError", {
    enumerable: true,
    get: function () { return errors.NotFoundError; }
});
Object.defineProperty(exports, "NotResolvedError", {
    enumerable: true,
    get: function () { return errors.NotResolvedError; }
});
exports.FileError = FileError;
exports.WalkError = WalkError;
exports.stripTrailingSep = stripTrailingSep;
