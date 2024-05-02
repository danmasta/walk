const path = require('path');
const isBuffer = require('buffer').Buffer.isBuffer;
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const format = require('util').format;

class WalkError extends Error {
    constructor (...args) {
        super(format(...args));
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = this.constructor.code;
    }
    static get code () {
        return 'ERR_WALK';
    }
}

class NotFoundError extends WalkError {
    constructor (path) {
        super('File or Directory Not Found: %s', path);
        this.path = path;
    }
    static get code () {
        return 'ERR_WALK_NOT_FOUND';
    }
}

class NotResolvedError extends WalkError {
    constructor (path) {
        super('Unable to Resolve File or Directory: %s', path);
        this.path = path;
    }
    static get code () {
        return 'ERR_WALK_NOT_RESOLVED';
    }
}

class FileError extends Error {
    constructor (...args) {
        super(format(...args));
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = this.constructor.code;
    }
    static get code () {
        return 'ERR_FILE';
    }
}

// Resolve file path with support for home char
function resolvePath (str, dir) {
    if (str[0] === '~') {
        return path.normalize(path.join(os.homedir(), str.slice(1)));
    } else {
        if (dir) {
            return path.resolve(dir, str);
        } else {
            return path.resolve(str);
        }
    }
}

async function resolvePathIfExists (str, dir, resolve) {
    let path;
    try {
        path = resolvePath(str, dir);
        await fs.promises.access(path, fs.constants.F_OK);
        return path;
    } catch (err) {
        if (resolve) {
            try {
                return require.resolve(path);
            } catch (err) {
                throw new NotResolvedError(str);
            }
        } else {
            throw new NotFoundError(str);
        }
    }
}

function resolvePathIfExistsSync (str, dir, resolve) {
    let path;
    try {
        path = resolvePath(str, dir);
        fs.accessSync(path, fs.constants.F_OK);
        return path;
    } catch (err) {
        if (resolve) {
            try {
                return require.resolve(path);
            } catch (err) {
                throw new NotResolvedError(str);
            }
        } else {
            throw new NotFoundError(str);
        }
    }
}

function normalize (str) {
    return str && path.normalize(str);
}

function stripStartingSep (str) {
    return str && normalize(str).replace(/^[\\/]+/, '');
}

function stripTrailingSep (str) {
    return str && normalize(str).replace(/[\\/]+$/, '');
}

function isStream (obj) {
    let pipe = obj && obj.pipe;
    if (pipe && typeof pipe === 'function') {
        return true;
    }
    return false;
}

function unixify (str) {
    return str.replace(/\\+/g, '/');
}

function defaults (...args) {

    let accumulator = {};

    function iterate (res, obj, def) {
        _.forOwn(obj, (val, key) => {
            if (_.has(def, key)) {
                if (_.isPlainObject(def[key])) {
                    res[key] = iterate(_.toPlainObject(res[key]), val, def[key]);
                } else {
                    if (res[key] === undefined) {
                        res[key] = val;
                    }
                }
            }
        });
        return res;
    }

    args.map(obj => {
        iterate(accumulator, obj, args.at(-1));
    });

    return accumulator;

}

function isNil (val) {
    return val == null;
}

function isNotNil (val) {
    return val != null;
}

function each (arr, fn) {
    if (Array.isArray(arr) || arr instanceof Map || arr instanceof Set) {
        arr.forEach(fn);
    } else {
        fn(arr, 0);
    }
}

function eachNotNil (arr, fn) {
    each(arr, (val, key) => {
        if (isNotNil(val)) {
            fn(val, key);
        }
    });
}

// Test if running in esm or commonjs mode
function isEsmMode () {
    return typeof module === 'undefined';
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object
function isModule (obj) {
    return isNotNil(obj) && obj[Symbol.toStringTag] === 'Module';
}

exports.WalkError = WalkError;
exports.NotFoundError = NotFoundError;
exports.NotResolvedError = NotResolvedError;
exports.FileError = FileError;
exports.resolvePath = resolvePath;
exports.resolvePathIfExists = resolvePathIfExists;
exports.resolvePathIfExistsSync = resolvePathIfExistsSync;
exports.normalize = normalize;
exports.stripStartingSep = stripStartingSep;
exports.stripTrailingSep = stripTrailingSep;
exports.isStream = isStream;
exports.isBuffer = isBuffer;
exports.unixify = unixify;
exports.defaults = defaults;
exports.isNil = isNil;
exports.isNotNil = isNotNil;
exports.each = each;
exports.eachNotNil = eachNotNil;
exports.isEsmMode = isEsmMode;
exports.isModule = isModule;
