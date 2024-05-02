const path = require('path');
const fs = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const util = require('./util');
const { BOM } = require('./constants');
const _ = require('lodash');

const defaults = {
    cwd: process.cwd(),
    root: undefined,
    path: undefined,
    relative: undefined,
    relativeFromCwd: undefined,
    dir: undefined,
    base: undefined,
    name: undefined,
    ext: undefined,
    stat: undefined,
    contents: undefined,
    encoding: 'utf8'
};

class File {

    constructor (opts) {

        Object.assign(this, util.defaults(opts, defaults));

        this.root = this.root ? util.stripTrailingSep(this.root) : this.cwd;

        if (!this.path && this.relative) {
            this.path = util.normalize(path.join(this.root, this.relative));
        }

        if (!this.path) {
            throw new util.FileError('Path or relative field is required');
        }

        this.relative = path.relative(this.root, this.path);
        this.relativeFromCwd = path.relative(this.cwd, this.path);
        this.dir = path.dirname(this.path);
        this.base = path.basename(this.path);
        this.ext = path.extname(this.path);
        this.name = path.basename(this.path, this.ext);

    }

    createReadStream (opts) {
        return createReadStream(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    createWriteStream (opts) {
        return createWriteStream(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    async append (data, opts) {
        return fs.appendFile(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    async read (opts) {
        return fs.readFile(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    async readAsString (opts) {
        if ((!opts || opts && !opts.encoding) && !this.encoding) {
            throw new util.FileError('Encoding is required to read as string');
        } else {
            return this.read(opts);
        }
    }

    async readAsBuffer (opts) {
        return this.read(
            _.assign(opts, { encoding: null })
        );
    }

    async readStr (...args) {
        return this.readAsString(...args);
    }

    async readBuf (...args) {
        return this.readAsBuffer(...args);
    }

    async write (data, opts) {
        return fs.writeFile(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    require () {
        return require(this.path);
    }

    async import () {
        switch (this.ext) {
            case '.json':
                return import(this.path, { assert: { type: 'json' }});
            default:
                return import(this.path);
        }
    }

    async requireOrImport () {
        switch (this.ext) {
            case '.json':
                if (util.isEsmMode()) {
                    return this.import();
                } else {
                    return this.require();
                }
            case '.js':
            case '.cjs':
                if (util.isEsmMode()) {
                    return this.import();
                } else {
                    try {
                        return this.require();
                    } catch (err) {
                        if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_REQUIRE_ASYNC_MODULE') {
                            return this.import();
                        }
                        throw err;
                    }
                }
            case '.mjs':
                return this.import();
            default:
                throw new util.FileError('File type not supported for require or import: %s', this.ext);
        }
    }

    async requireImportOrRead () {
        try {
            return this.requireOrImport();
        } catch (err) {
            if (err.code === 'ERR_FILE') {
                return this.read();
            }
            throw err;
        }
    }

    isModule () {
        return util.isModule(this.contents);
    }

    isBuffer () {
        return util.isBuffer(this.contents);
    }

    isStream () {
        return util.isStream(this.contents);
    }

    isNull () {
        return this.contents === null;
    }

    isNil () {
        return util.isNil(this.contents);
    }

    isString () {
        return typeof this.contents === 'string';
    }

    isDirectory () {
        return this.stat && this.stat.isDirectory();
    }

    isSymbolicLink () {
        return this.stat && this.stat.isSymbolicLink();
    }

    isBlockDevice () {
        return this.stat && this.stat.isBlockDevice();
    }

    isCharacterDevice () {
        return this.stat && this.stat.isCharacterDevice();
    }

    isFIFO () {
        return this.stat && this.stat.isFIFO();
    }

    isFile () {
        return this.stat && this.stat.isFile();
    }

    isSocket () {
        return this.stat && this.stat.isSocket();
    }

    isEmpty () {
        return this.stat && this.stat.size === 0;
    }

    async getEncodingFromBom () {

        let buff = Buffer.alloc(4);
        let enc = undefined;
        let fd = await fs.open(this.path, 'r');

        await fd.read(buff, 0, 4, 0);
        await fd.close();

        _.some(BOM, (val, key) => {
            if (buff.indexOf(val) === 0) {
                return enc = key;
            }
        });

        return enc;

    }

    static get FileError () {
        return util.FileError;
    }

}

module.exports = File;
