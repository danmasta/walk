const path = require('path');
const isBuffer = require('buffer').Buffer.isBuffer;
const micromatch = require('micromatch');
const _ = require('lodash');

const defaults = {
    cwd: process.cwd(),
    root: '/',
    exclude: ['.git', 'node_modules', 'bower_components'],
    require: false,
    read: true,
    src: '**/*',
    dot: true
};

// normalize opts with simple class
class Options {

    constructor(opts = {}) {

        _.defaults(this, opts, defaults);

        this.root = stripTrailingSep(path.join(this.cwd, this.root));

        this.regex = new RegExp(_.join(_.concat(this.exclude), '|') || 'a^');

        this.matcher = micromatch.matcher(this.src, { dot: this.dot });

    }

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

exports.opts = function (opts) {
    return opts instanceof Options ? opts : new Options(opts);
};

exports.normalize = normalize;
exports.stripStartingSep = stripStartingSep;
exports.stripTrailingSep = stripTrailingSep;
exports.isStream = isStream;
exports.isBuffer = isBuffer;
