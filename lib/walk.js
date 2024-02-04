const Readable = require('stream').Readable;
const fs = require('fs');
const path = require('path');
const os = require('os');
const micromatch = require('micromatch');
const _ = require('lodash');
const File = require('./file');
const util = require('./util');
const constants = require('./constants');

const defaults = {
    cwd: process.cwd(),
    root: './',
    src: constants.GLOBS.all,
    dot: true,
    ignore: constants.GLOBS.ignore,
    encoding: 'utf8',
    objectMode: true,
    resolve: true
};

class NotFoundError extends Error {
    constructor (str) {
        let msg = `File or Directory Not Found: ${str}`;
        super(msg);
        Error.captureStackTrace(this, NotFoundError);
        this.name = 'NotFoundError';
        this.code = 'PATHNOTFOUND';
        this.path = str;
    }
}

class NotResolvedError extends Error {
    constructor (str) {
        let msg = `Unable to Resolve File or Directory: ${str}`;
        super(msg);
        Error.captureStackTrace(this, NotResolvedError);
        this.name = 'NotResolvedError';
        this.code = 'PATHNOTRESOLVED';
        this.path = str;
    }
}

class Walk extends Readable {

    constructor (paths, opts) {

        if (_.isPlainObject(paths)) {
            [opts, paths] = [paths, opts];
        }

        if (!_.isPlainObject(opts)) {
            opts = {};
        }

        if (paths) {
            if (!_.isArray(paths)) {
                if (!opts.root) {
                    opts.root = paths;
                    paths = [];
                } else {
                    paths = [paths];
                }
            }
        } else {
            paths = [];
        }

        opts = _.defaults(opts, defaults);

        super({ objectMode: true });

        if (!opts.dot && opts.src === constants.GLOBS.all) {
            opts.src = constants.GLOBS.dot;
        }

        this.opts = opts;
        this.include = null;
        this.exclude = null;

        opts.root = util.stripTrailingSep(this.getRootWalkPath(opts.root));

        if (opts.src) {
            this.include = micromatch.matcher(opts.src, { dot: opts.dot });
        }

        if (opts.ignore) {
            this.exclude = micromatch.matcher(opts.ignore, { dot: opts.dot });
        }

        this.queue = [];
        this.paths = paths;
        this.pending = 0;
        this.inFlight = 0;

        // Should be true until we push at least one file on each iteration
        this.shouldRead = true;

        if (!this.paths.length) {
            this.paths.push(this.opts.root);
        }

    }

    _read () {
        if (!this.inFlight && !this.pending) {
            this.handleRead();
        }
    }

    handleRead () {
        if (this.canRead()) {
            this.readFromQueue().then(() => {
                if (this.shouldRead) {
                    this.handleRead();
                }
            });
        } else {
            if (this.paths.length) {
                this.addPathIfExists(this.paths.shift()).then(() => {
                    if (this.shouldRead) {
                        this.handleRead();
                    }
                });
            } else if (this.isEmpty()) {
                this.push(null);
            }
        }
    }

    canRead () {
        return this.queue.length > 0;
    }

    isEmpty () {
        return !this.inFlight && !this.pending && !this.queue.length && !this.paths.length;
    }

    resolvePathFromHomeOrRoot (str) {
        if (str && str[0] === '~') {
            return path.normalize(path.join(os.homedir(), str.slice(1)));
        } else {
            return path.resolve(this.opts.root, str);
        }
    }

    resolvePathFromHomeOrCWD (str) {
        if (str && str[0] === '~') {
            return path.normalize(path.join(os.homedir(), str.slice(1)));
        } else {
            return path.resolve(this.opts.cwd, str);
        }
    }

    // Resolve path from user home or cwd
    // Verifies path exists or throws error
    getRootWalkPath (str) {

        let res = this.resolvePathFromHomeOrCWD(str);
        let stat = null;

        try {
            stat = fs.statSync(res);
            if (stat.isDirectory() || stat.isFile()) {
                return res;
            } else {
                this.destroy(new Walk.NotFoundError(res));
            }
        } catch (err) {
            if (this.opts.resolve) {
                try {
                    return require.resolve(res);
                } catch (err) {
                    this.destroy(new Walk.NotResolvedError(res));
                }
            } else {
                this.destroy(new Walk.NotFoundError(res));
            }
        }

    }

    addPathIfExists (str) {

        str = this.resolvePathFromHomeOrRoot(str);
        this.pending++;

        return fs.promises.access(str, fs.constants.F_OK).then(() => {

            this.pending--;
            this.pushToQueue(str);

        }).catch(err => {

            if (this.opts.resolve) {
                try {
                    this.pending--;
                    this.pushToQueue(require.resolve(str));
                } catch (err) {
                    this.destroy(new Walk.NotResolvedError(str));
                }
            } else {
                this.pending--;
                this.destroy(new Walk.NotFoundError(str));
            }

        });

    }

    pushToQueue (str) {
        return this.queue.push(str);
    }

    readFromQueue () {
        return this.walkFileOrDir(this.queue.shift());
    }

    readDir (str) {

        this.inFlight++;

        return fs.promises.readdir(str).then(list => {

            _.each(list, name => {

                let abs = path.resolve(str, name);
                let rel = path.relative(this.opts.root, abs);

                if (!this.exclude || !this.exclude(rel)) {
                    this.pushToQueue(abs);
                }

            });

            this.inFlight--;
            this.shouldRead = true;

        });

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

    addFile (str, stat) {

        this.inFlight++;

        return new Promise((resolve, reject) => {

            let file = this.createFile(str, stat);

            if (!this.include || this.include(file.relative || file.base)) {
                this.push(file);
                this.shouldRead = false;
            } else {
                this.shouldRead = true;
            }

            this.inFlight--;
            resolve();

        });

    }

    walkFileOrDir (str) {

        this.pending++;

        return fs.promises.stat(str).then(stat => {
            this.pending--;
            if (stat.isDirectory()) {
                return this.readDir(str);
            } else {
                return this.addFile(str, stat);
            }
        });

    }

    iterate (fn, res) {

        this.on('data', file => {
            if (fn) {
                try {
                    file = fn(file);
                } catch (err) {
                    this.destroy(err);
                }
            }
            if (res) {
                res.push(file);
            }
        });

        return new Promise((resolve, reject) => {
            this.once('end', () => {
                resolve(res);
            });
            this.once('error', err => {
                reject(err);
            });
        });

    }

    map (fn) {
        fn = _.isFunction(fn) ? fn : file => file;
        return this.iterate(fn, []);
    }

    each (fn) {
        fn = _.isFunction(fn) ? fn : _.noop;
        return this.iterate(fn);
    }

    promise () {
        return this.iterate(null, []);
    }

    then (...args) {
        return this.promise().then(...args);
    }

    catch (fn) {
        return this.promise().catch(fn);
    }

    static factory () {
        let Fn = this;
        return function factory (...args) {
            return new Fn(...args);
        };
    }

    static get NotFoundError () {
        return NotFoundError;
    }

    static get NotResolvedError () {
        return NotResolvedError;
    }

    static get constants () {
        return constants;
    }

    static get File () {
        return File;
    }

}

module.exports = Walk;
