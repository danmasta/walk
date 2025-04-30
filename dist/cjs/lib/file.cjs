var lo = require('lo');
var node_fs = require('node:fs');
var node_path = require('node:path');
var node_process = require('node:process');
var constants = require('./constants.cjs');
var util = require('./util.cjs');

const { appendFile, readFile, writeFile, open } = node_fs.promises;

const defs = {
    cwd: node_process.cwd(),
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
        Object.assign(this, lo.defaults(opts, defs));
        if (this.root) {
            this.root = util.stripTrailingSep(this.root);
        } else {
            this.root = this.cwd;
        }
        if (!this.path && this.relative) {
            this.path = node_path.join(this.root, this.relative);
        }
        if (!this.path) {
            throw new util.FileError('Path or relative field is required');
        }
        let path = node_path.parse(this.path);
        this.relative = node_path.relative(this.root, this.path);
        this.relativeFromCwd = node_path.relative(this.cwd, this.path);
        this.dir = path.dir;
        this.base = path.base;
        this.ext = path.ext;
        this.name = node_path.basename(this.path, this.ext);
    }

    createReadStream (opts) {
        return node_fs.createReadStream(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    createWriteStream (opts) {
        return node_fs.createWriteStream(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    async append (data, opts) {
        return appendFile(
            this.path,
            data,
            { encoding: this.encoding, ...opts }
        );
    }

    appendSync (data, opts) {
        return node_fs.appendFileSync(
            this.path,
            data,
            { encoding: this.encoding, ...opts }
        );
    }

    async read (opts) {
        return readFile(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    readSync (opts) {
        return node_fs.readFileSync(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    async readAsString (opts) {
        if (!opts?.encoding && !this.encoding) {
            throw new util.FileError('Encoding is required to read as string');
        }
        return this.read(opts);
    }

    readAsStringSync (opts) {
        if (!opts?.encoding && !this.encoding) {
            throw new util.FileError('Encoding is required to read as string');
        }
        return this.readSync(opts);
    }

    async readAsBuffer (opts) {
        return this.read(
            { ...opts, encoding: null }
        );
    }

    readAsBufferSync (opts) {
        return this.readSync(
            { ...opts, encoding: null }
        );
    }

    async readStr (...args) {
        return this.readAsString(...args);
    }

    readStrSync (...args) {
        return this.readAsStringSync(...args);
    }

    async readBuf (...args) {
        return this.readAsBuffer(...args);
    }

    readBufSync (...args) {
        return this.readAsBufferSync(...args);
    }

    async write (data, opts) {
        return writeFile(
            this.path,
            data,
            { encoding: this.encoding, ...opts }
        );
    }

    writeSync (data, opts) {
        return node_fs.writeFileSync(
            this.path,
            data,
            { encoding: this.encoding, ...opts }
        );
    }

    require () {
        return lo.require(this.path, this.ext);
    }

    async import () {
        switch (this.ext) {
            case '.json':
                return import(this.path, { assert: { type: 'json' } });
            default:
                return import(this.path);
        }
    }

    importOrRequire () {
        return lo.importOrRequire(this.path, this.ext);
    }

    async importRequireOrRead () {
        return lo.importRequireOrRead(this.path, this.encoding);
    }

    isModule () {
        return lo.isModule(this.contents);
    }

    isBuffer () {
        return lo.isBuffer(this.contents);
    }

    isStream () {
        return lo.isStream(this.contents);
    }

    isNull () {
        return this.contents === null;
    }

    isNil () {
        return lo.isNil(this.contents);
    }

    isString () {
        return lo.isString(this.contents);
    }

    isDirectory () {
        return !!this.stat?.isDirectory();
    }

    isSymbolicLink () {
        return !!this.stat?.isSymbolicLink();
    }

    isBlockDevice () {
        return !!this.stat?.isBlockDevice();
    }

    isCharacterDevice () {
        return !!this.stat?.isCharacterDevice();
    }

    isFIFO () {
        return !!this.stat?.isFIFO();
    }

    isFile () {
        return !!this.stat?.isFile();
    }

    isSocket () {
        return !!this.stat?.isSocket();
    }

    isEmpty () {
        return this.stat?.size === 0;
    }

    static getEncodingFromBuff (buff) {
        let enc;
        lo.some(constants.BOM, ([name, bytes]) => {
            let match = lo.every(bytes, (byte, i) => {
                return byte === buff[i];
            });
            if (match) {
                return enc = name;
            }
        });
        return enc;
    }

    async getEncodingFromBOM () {
        let buff = new Uint8Array(4);
        let fd = await open(this.path, 'r');
        await fd.read(buff, 0, 4, 0);
        await fd.close();
        return File.getEncodingFromBuff(buff);
    }

    getEncodingFromBOMSync () {
        let buff = new Uint8Array(4);
        let fd = node_fs.openSync(this.path, 'r');
        node_fs.readSync(fd, buff, 0, 4, 0);
        node_fs.closeSync(fd);
        return File.getEncodingFromBuff(buff);
    }

    static get FileError () {
        return util.FileError;
    }

}

exports.File = File;
exports.default = File;
