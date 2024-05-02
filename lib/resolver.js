const fs = require('fs/promises');
const path = require('path');
const micromatch = require('micromatch');
const util = require('./util');
const { GLOBS } = require('./constants');
const File = require('./file');

const defaults = {
    cwd: process.cwd(),
    root: './',
    src: GLOBS.all,
    dot: true,
    ignore: GLOBS.ignore,
    encoding: 'utf8',
    resolve: true,
    paths: undefined
};

class FileResolver {

    constructor (opts) {

        // Normalize root and relative paths
        if (opts.paths) {
            if (!Array.isArray(opts.paths)) {
                if (!opts.root) {
                    opts.root = opts.paths;
                    opts.paths = [];
                } else {
                    opts.paths = [opts.paths];
                }
            }
        } else {
            opts.paths = [];
        }

        this.opts = opts = util.defaults(opts, defaults);

        opts.root = util.stripTrailingSep(
            util.resolvePathIfExistsSync(opts.root, opts.cwd, opts.resolve)
        );

        this.include = null;
        this.exclude = null;
        this.queue = [];
        this.paths = [];

        if (!opts.dot && opts.src === GLOBS.all) {
            opts.src = GLOBS.dot;
        }

        if (opts.src) {
            this.include = micromatch.matcher(opts.src, { dot: opts.dot });
        }

        if (opts.ignore) {
            this.exclude = micromatch.matcher(opts.ignore, { dot: opts.dot });
        }

        this.paths.push(...opts.paths);

        if (!this.paths.length) {
            this.paths.push(opts.root);
        }

    }

    isEmpty () {
        return !this.queue.length && !this.paths.length;
    }

    // Read until next available file is found
    // Returns file instance or null if empty
    async next () {
        if (this.isEmpty()) {
            return null;
        } else {
            let file;
            while ((file = await this.readFromQueue()) === null) {
                if (this.isEmpty()) {
                    return null;
                }
            }
            return file;
        }
    }

    async readFromQueue () {
        if (this.queue.length) {
            let path = this.queue.shift();
            return await this.walkFileOrDir(path);
        }
        if (this.paths.length) {
            let path = await util.resolvePathIfExists(
                this.paths.shift(), this.opts.root, this.opts.resolve
            );
            return await this.walkFileOrDir(path);
        }
        return null;
    }

    async walkFileOrDir (str) {
        let stat = await fs.stat(str);
        if (stat.isDirectory()) {
            return this.readDir(str);
        } else {
            return this.readFile(str, stat);
        }
    }

    async readDir (str) {
        let list = await fs.readdir(str);
        util.each(list, base => {
            let abs = path.resolve(str, base), rel = path.relative(this.opts.root, abs);
            if (!this.isExcluded(rel)) {
                this.queue.push(abs);
            }
        });
        return null;
    }

    readFile (str, stat) {
        let file = this.createFile(str, stat);
        if (this.isIncluded(file.relative || file.base)) {
            return file;
        }
        return null;
    }

    isExcluded (str) {
        return !!this.exclude && this.exclude(str);
    }

    isIncluded (str) {
        return !this.include || this.include(str);
    }

    createFile (str, stat) {
        return new this.constructor.File({
            path: str,
            stat,
            cwd: this.opts.cwd,
            root: this.opts.root,
            encoding: this.opts.encoding
        });
    }

    static get File () {
        return File;
    }

}

module.exports = FileResolver;
