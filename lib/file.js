const path = require('path');
const _ = require('lodash');
const util = require('./util');

const defaults = {
    cwd: process.cwd(),
    root: null,
    path: null,
    relative: null,
    dir: null,
    base: null,
    name: null,
    ext: null,
    stat: null,
    contents: null
};

class File {

    constructor(opts) {

        let parsed = null;

        _.defaults(this, opts, defaults);

        this.root = this.root ? util.stripTrailingSep(this.root) : this.cwd;

        if (!this.path && this.relative) {
            this.path = this.path || util.normalize(path.join(this.root, this.relative));
        }

        if (!this.path) {
            throw new Error('Path or relative field is required');
        }

        if (this.relative) {
            this.relative = util.stripStartingSep(this.relative);
        } else {
            this.relative = util.stripStartingSep(this.path.slice(this.root.length));
        }

        parsed = path.parse(this.path);

        this.dir = parsed.dir;
        this.base = parsed.base;
        this.ext = parsed.ext;
        this.name = parsed.name;

    }

    isBuffer() {
        return util.isBuffer(this.contents);
    }

    isStream() {
        return util.isStream(this.contents);
    }

    isNull() {
        return this.contents === null;
    }

    isDirectory() {
        return this.stat && this.stat.isDirectory();
    }

    isSymbolic() {
        return this.stat && this.stat.isSymbolicLink();
    }

}

module.exports = File;
