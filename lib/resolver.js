import { defaults, each, isArray, resolveIfExists, resolveIfExistsSync } from 'lo';
import { promises, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import picomatch from 'picomatch';
import { GLOB } from './constants.js';
import { File } from './file.js';
import { stripTrailingSep } from './util.js';
const { readdir, stat } = promises;

const defs = {
    cwd: process.cwd(),
    root: '.',
    src: GLOB.all,
    dot: true,
    ignore: GLOB.ignore,
    encoding: 'utf8',
    require: false,
    paths: undefined,
    include: undefined,
    exclude: undefined
};

export class FileResolver {

    constructor (opts={}) {
        if (opts.paths) {
            if (!isArray(opts.paths)) {
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
        this.opts = opts = defaults(opts, defs);
        this.include = opts.include;
        this.exclude = opts.exclude;
        this.queue = [];
        this.paths = [];
        opts.root = stripTrailingSep(
            resolve(opts.cwd, opts.root)
        );
        if (!opts.dot && opts.src === GLOB.all) {
            opts.src = GLOB.dot;
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
                path = await resolveIfExists(
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
                path = resolveIfExistsSync(
                    path, { dir: opts.root, require: opts.require }
                );
                if (resolve) {
                    opts.root = path;
                }
            }
        }
        if (path) {
            return this.readFileOrDir(path, statSync(path), true);
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
        each(entries, base => {
            let abs = resolve(dir, base);
            let rel = relative(opts.root, abs);
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
        return this.addDir(dir, readdirSync(dir));
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
        return File;
    }

}

export default FileResolver;
