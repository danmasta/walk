const path = require('path');
const isBuffer = require('buffer').Buffer.isBuffer;
const micromatch = require('micromatch');
const _ = require('lodash');
const Promise = require('bluebird');

const defaults = {
    cwd: process.cwd(),
    root: './',
    exclude: ['.git', 'node_modules', 'bower_components'],
    require: false,
    read: true,
    src: '**/*',
    dot: true
};

// normalize opts with simple class
class Options {

    constructor(opts) {

        _.defaults(this, opts, defaults);

        this.root = stripTrailingSep(path.resolve(this.cwd, this.root));
        this.regex = new RegExp(_.join(_.concat(this.exclude), '|') || 'a^');
        this.matcher = micromatch.matcher(this.src, { dot: this.dot });

    }

}

function concatMap(collection, fn) {

    let res = [];

    _.map(collection, (item, key) => {

        let x = fn(item, key);

        if (_.isArray(x)) {
            return res.push.apply(res, x);
        }

        if (x !== undefined) {
            res.push(x);
        }

    });

    return res;

}

function concatMapAsync(promise, fn) {

    let res = [];

    return promise.map(fn).map(x => {

        if (_.isArray(x)) {
            return res.push.apply(res, x);
        }

        if (x !== undefined) {
            res.push(x);
        }

    }).then(() => {

        return res;

    });

}

function normalize(str) {
    return str && path.normalize(str);
}

function stripStartingSep(str) {
    return str && normalize(str).replace(/^[\\/]+/, '');
}

function stripTrailingSep(str) {
    return str && normalize(str).replace(/[\\/]+$/, '');
}

function isStream(contents) {

    let pipe = contents && contents.pipe;

    if (pipe && typeof pipe === 'function') {
        return true;
    } else {
        return false;
    }

}

exports.opts = function(str, opts) {

    if(str instanceof Options){
        return str;
    }

    if (str && _.isPlainObject(opts)) {

        opts.root = str;

    } else if (_.isString(str)) {

        opts = { root: str };

    } else {

        opts = str;

    }

    return new Options(opts);

};

exports.normalize = normalize;
exports.stripStartingSep = stripStartingSep;
exports.stripTrailingSep = stripTrailingSep;
exports.isStream = isStream;
exports.isBuffer = isBuffer;
exports.concatMap = concatMap;
exports.concatMapAsync = concatMapAsync;
