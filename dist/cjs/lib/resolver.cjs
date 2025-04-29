var lo = require('lo');
var node_fs = require('node:fs');
var node_path = require('node:path');
var picomatch = require('picomatch');
var constants = require('./constants.cjs');
var file = require('./file.cjs');
var util = require('./util.cjs');

const { readdir, stat } = node_fs.promises;

const defs = {
    cwd: process.cwd(),
    root: '.',
    src: constants.GLOB.all,
    dot: true,
    ignore: constants.GLOB.ignore,
    encoding: 'utf8',
    require: false,
    paths: undefined,
    include: undefined,
    exclude: undefined
};

class FileResolver {

    constructor (opts={}) {
        if (opts.paths) {
            if (!lo.isArray(opts.paths)) {
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
        this.opts = opts = lo.defaults(opts, defs);
        this.include = opts.include;
        this.exclude = opts.exclude;
        this.queue = [];
        this.paths = [];
        opts.root = util.stripTrailingSep(
            node_path.resolve(opts.cwd, opts.root)
        );
        if (!opts.dot && opts.src === constants.GLOB.all) {
            opts.src = constants.GLOB.dot;
        }
        if (!this.include && opts.src) {
            this.include = picomatch(opts.src, { dot: opts.dot });
        }
        if (!this.exclude && opts.ignore) {
            this.exclude = picomatch(opts.ignore, { dot: opts.dot });
        }
        this.paths.push(...opts.paths);
        this.resolve = false;
        if (!this.paths.length) {
            this.resolve = !!opts.require;
            this.paths.push(opts.root);
        }
    }

    end () {
        this.queue.length = 0;
        this.paths.length = 0;
    }

    isEmpty () {
        return !this.queue.length && !this.paths.length;
    }

    isExcluded (str) {
        return !!this.exclude && this.exclude(str);
    }

    isIncluded (str) {
        return !this.include || this.include(str);
    }

    // Read until next available file is found
    // Return File instance or null if empty
    next (sync) {
        if (this.isEmpty()) {
            return null;
        } else {
            if (sync) {
                return this.nextFileSync();
            }
            return this.nextFile();
        }
    }

    async nextFile () {
        let file;
        while ((file = await this.readFromQueue()) === null) {
            if (this.isEmpty()) {
                return null;
            }
        }
        return file;
    }

    nextFileSync () {
        let file;
        while ((file = this.readFromQueueSync()) === null) {
            if (this.isEmpty()) {
                return null;
            }
        }
        return file;
    }

    async readFromQueue () {
        let { queue, paths, opts } = this;
        let path = queue.shift();
        if (!path) {
            path = paths.shift();
            if (path) {
                let resolve = this.resolve && path === opts.root;
                path = await lo.resolveIfExists(
                    path, { dir: opts.root, require: opts.require }
                );
                if (resolve) {
                    opts.root = path;
                }
            }
        }
        if (path) {
            return this.readFileOrDir(path, await stat(path));

        }
        return null;
    }

    readFromQueueSync () {
        let { queue, paths, opts } = this;
        let path = queue.shift();
        if (!path) {
            path = paths.shift();
            if (path) {
                let resolve = this.resolve && path === opts.root;
                path = lo.resolveIfExistsSync(
                    path, { dir: opts.root, require: opts.require }
                );
                if (resolve) {
                    opts.root = path;
                }
            }
        }
        if (path) {
            return this.readFileOrDir(path, node_fs.statSync(path), true);
        }
        return null;
    }

    readFileOrDir (str, stat, sync) {
        if (stat.isDirectory()) {
            if (sync) {
                return this.readDirSync(str);
            }
            return this.readDir(str);
        }
        return this.readFile(str, stat);
    }

    addDir (dir, entries) {
        let { queue, opts } = this;
        lo.each(entries, base => {
            let abs = node_path.resolve(dir, base);
            let rel = node_path.relative(opts.root, abs);
            if (!this.isExcluded(rel)) {
                queue.push(abs);
            }
        });
        return null;
    }

    async readDir (dir) {
        return this.addDir(dir, await readdir(dir));
    }

    readDirSync (dir) {
        return this.addDir(dir, node_fs.readdirSync(dir));
    }

    readFile (str, stat) {
        let file = this.createFile(str, stat);
        if (this.isIncluded(file.relative || file.base)) {
            return file;
        }
        return null;
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
        return file.File;
    }

}

exports.FileResolver = FileResolver;
exports.default = FileResolver;
