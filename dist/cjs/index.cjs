var lo = require('lo');
var file = require('./lib/file.cjs');
var resolver = require('./lib/resolver.cjs');
var util = require('./lib/util.cjs');
var walk$1 = require('./lib/walk.cjs');
var errors = require('lo/errors');

const walk = walk$1.Walk.factory();
const sync = walk$1.Walk.factory(true);

Object.defineProperty(exports, "BREAK", {
    enumerable: true,
    get: function () { return lo.BREAK; }
});
exports.File = file.File;
exports.FileResolver = resolver.FileResolver;
exports.FileError = util.FileError;
exports.WalkError = util.WalkError;
exports.Walk = walk$1.Walk;
Object.defineProperty(exports, "NotFoundError", {
    enumerable: true,
    get: function () { return errors.NotFoundError; }
});
Object.defineProperty(exports, "NotResolvedError", {
    enumerable: true,
    get: function () { return errors.NotResolvedError; }
});
exports.default = walk;
exports.sync = sync;
exports.walk = walk;
