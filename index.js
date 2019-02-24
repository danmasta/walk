const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const File = require('./lib/file');
const util = require('./lib/util');
const micromatch = require('micromatch');
const Readable = require('stream').Readable;
const _ = require('lodash');

const readdirAsync = Promise.promisify(fs.readdir);
const statAsync = Promise.promisify(fs.stat);
const readFileAsync = Promise.promisify(fs.readFile);
const accessAsync = Promise.promisify(fs.access);

const constants = {
    GLOBS: {
        all: '*(../)*(**/)*',
        ignore: '*(../)*(**/)(.git|node_modules)',
        dot: '*(../)*(**/)!(.)*'
    }
};

const defaults = {
    cwd: process.cwd(),
    root: './',
    require: false,
    stream: false,
    read: false,
    sync: false,
    contents: false,
    buffer: false,
    src: constants.GLOBS.all,
    dot: true,
    ignore: constants.GLOBS.ignore,
    cb: _.noop
};

class Walker {

    constructor (opts) {

        opts = _.defaults(opts, defaults);

        if (!opts.dot && opts.src === constants.GLOBS.all) {
            opts.src = constants.GLOBS.dot;
        }

        opts.root = util.stripTrailingSep(path.resolve(opts.cwd, opts.root));

        if (opts.require || opts.read === 'require') {
            opts.read = 'require';
        } else if (opts.stream || opts.read === 'stream') {
            opts.read = 'stream';
        } else if (opts.read || opts.contents) {
            opts.read = 'contents';
        }

        this.opts = opts;
        this.include = null;
        this.exclude = null;

        if (opts.src) {
            this.include = micromatch.matcher(opts.src, { dot: opts.dot });
        }

        if (opts.ignore) {
            this.exclude = micromatch.matcher(opts.ignore, { dot: opts.dot });
        }

    }

    _resolve (str) {
        return path.resolve(this.opts.root, str);
    }

    _contents (file) {

        return Promise.resolve().then(() => {

            if (this.opts.read === 'require') {

                return require(file.path);

            } else if (this.opts.read === 'stream') {

                return fs.createReadStream(file.path);

            } else {

                return readFileAsync(file.path).then(buff => {
                    if (this.opts.buffer) {
                        return buff;
                    } else {
                        return buff.toString();
                    }
                });

            }

        });

    }

    _contentsSync (file) {

        if (this.opts.read === 'require') {

            return require(file.path);

        } else if (this.opts.read === 'stream') {

            return fs.createReadStream(file.path);

        } else {

            let buff = fs.readFileSync(file.path);

            if (this.opts.buffer) {
                return buff;
            } else {
                return buff.toString();
            }

        }

    }

    _walk (str) {

        return statAsync(str).then(stat => {

            if (stat.isDirectory()) {

                return readdirAsync(str).map(name => {

                    let res = path.resolve(str, name);
                    let rel = path.relative(this.opts.root, res);

                    if (!this.exclude || !this.exclude(rel)) {
                        return this._walk(res);
                    }

                });

            } else {

                let file = new File({ path: str, stat: stat, cwd: this.opts.cwd, root: this.opts.root });

                if (!this.include || this.include(file.relative || file.base)) {

                    if (this.opts.read) {
                        return this._contents(file).then(contents => {
                            file.contents = contents;
                            this.opts.cb(file);
                        });
                    } else {
                        return this.opts.cb(file);
                    }

                }

            }

        });

    }

    _walkSync (str) {

        let stat = fs.statSync(str);

        if (stat.isDirectory()) {

            return fs.readdirSync(str).map(name => {

                let res = path.resolve(str, name);
                let rel = path.relative(this.opts.root, res);

                if (!this.exclude || !this.exclude(rel)) {
                    return this._walkSync(res);
                }

            });

        } else {

            let file = new File({ path: str, stat: stat, cwd: this.opts.cwd, root: this.opts.root });

            if (!this.include || this.include(file.relative || file.base)) {

                if (this.opts.read) {
                    file.contents = this._contentsSync(file);
                }

                return this.opts.cb(file);

            }

        }

    }

    walk (str) {

        str = this._resolve(str);

        return accessAsync(str, fs.constants.F_OK).then(() => {

            return str;

        }).catch(() => {

            return require.resolve(str);

        }).then(str => {

            return this._walk(str);

        });


    }

    sync (str) {

        str = this._resolve(str);

        try {

            fs.accessSync(str, fs.constants.F_OK);

        } catch (err) {

            str = require.resolve(str);

        }

        return this._walkSync(str);

    }

}

class WalkStream extends Readable {

    constructor (str, opts) {

        super({ objectMode: true });

        opts = _.assign(opts, { cb: this.push.bind(this) });

        this._str = str;
        this._walker = new Walker(opts);

    }

    _read (size) {

        if (!this.init) {
            this._init();
        }

    }

    _init () {

        this.init = true;

        if (!this._walker.opts.sync) {
            this._walker.walk(this._str).then(() => {
                this.push(null);
            });
        } else {
            this._walker.sync(this._str);
            this.push(null);
        }

    }

}

function _walk (str, opts) {

    let res = [];
    let cb = res.push.bind(res);
    let walker = null;

    if (_.isFunction(opts && opts.cb)) {
        cb = file => {
            res.push(opts.cb(file));
        };
    }

    walker = new Walker(_.assign(null, opts, { cb }));

    return walker.walk(str).then(() => {
        return res;
    });

}

function _sync (str, opts) {

    let res = [];
    let cb = res.push.bind(res);
    let walker = null;

    if (_.isFunction(opts && opts.cb)) {
        cb = file => {
            res.push(opts.cb(file));
        };
    }

    walker = new Walker(_.assign(null, opts, { cb, sync: true }));
    walker.sync(str);

    return res;

}

function _contents (str, opts) {

    opts = _.assign(opts, { read: true });

    return _walk(str, opts);

}

function _contentsSync (str, opts) {

    opts = _.assign(opts, { read: true, sync: true });

    return _sync(str, opts);

}

function _require (str, opts) {

    opts = _.assign(opts, { require: true });

    return _walk(str, opts);

}

function _requireSync (str, opts) {

    opts = _.assign(opts, { require: true, sync: true });

    return _sync(str, opts);

}

function _stream (str, opts) {

    opts = _.assign(opts);

    return new WalkStream(str, opts);

}

function _streamSync (str, opts) {

    opts = _.assign(opts, { sync: true });

    return new WalkStream(str, opts);

}

function _each (str, opts, cb) {

    if (_.isFunction(opts)) {
        cb = opts;
    }

    opts = _.assign(opts, { cb: cb });

    return _walk(str, opts);

}

function _eachSync (str, opts, cb) {

    if (_.isFunction(opts)) {
        cb = opts;
    }

    opts = _.assign(opts, { cb: cb });

    return _sync(str, opts);

}

exports = module.exports = _walk;
exports.walk = _walk;
exports.sync = _sync;
exports.Walker = Walker;
exports.contents = _contents;
exports.contents.sync = _contentsSync;
exports.require = _require;
exports.require.sync = _requireSync;
exports.stream = _stream;
exports.stream.sync = _streamSync;
exports.each = _each;
exports.each.sync = _eachSync;
