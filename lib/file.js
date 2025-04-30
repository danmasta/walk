import { defaults, every, importOrRequire, importRequireOrRead, isBuffer, isModule, isNil, isStream, isString, require, some } from 'lo';
import { appendFileSync, closeSync, createReadStream, createWriteStream, openSync, promises, readFileSync, readSync, writeFileSync } from 'node:fs';
import { basename, join, parse, relative } from 'node:path';
import { cwd } from 'node:process';
import { BOM } from './constants.js';
import { FileError, stripTrailingSep } from './util.js';
const { appendFile, readFile, writeFile, open } = promises;

const defs = {
    cwd: cwd(),
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

export class File {

    constructor (opts) {
        Object.assign(this, defaults(opts, defs));
        if (this.root) {
            this.root = stripTrailingSep(this.root);
        } else {
            this.root = this.cwd;
        }
        if (!this.path && this.relative) {
            this.path = join(this.root, this.relative);
        }
        if (!this.path) {
            throw new FileError('Path or relative field is required');
        }
        let path = parse(this.path);
        this.relative = relative(this.root, this.path);
        this.relativeFromCwd = relative(this.cwd, this.path);
        this.dir = path.dir;
        this.base = path.base;
        this.ext = path.ext;
        this.name = basename(this.path, this.ext);
    }

    createReadStream (opts) {
        return createReadStream(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    createWriteStream (opts) {
        return createWriteStream(
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
        return appendFileSync(
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
        return readFileSync(
            this.path,
            { encoding: this.encoding, ...opts }
        );
    }

    async readAsString (opts) {
        if (!opts?.encoding && !this.encoding) {
            throw new FileError('Encoding is required to read as string');
        }
        return this.read(opts);
    }

    readAsStringSync (opts) {
        if (!opts?.encoding && !this.encoding) {
            throw new FileError('Encoding is required to read as string');
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
        return writeFileSync(
            this.path,
            data,
            { encoding: this.encoding, ...opts }
        );
    }

    require () {
        return require(this.path, this.ext);
    }

    async import () {
        switch (this.ext) {
            case '.json':
                return import(this.path, { with: { type: 'json' }});
            default:
                return import(this.path);
        }
    }

    importOrRequire () {
        return importOrRequire(this.path, this.ext);
    }

    async importRequireOrRead () {
        return importRequireOrRead(this.path, this.encoding);
    }

    isModule () {
        return isModule(this.contents);
    }

    isBuffer () {
        return isBuffer(this.contents);
    }

    isStream () {
        return isStream(this.contents);
    }

    isNull () {
        return this.contents === null;
    }

    isNil () {
        return isNil(this.contents);
    }

    isString () {
        return isString(this.contents);
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
        some(BOM, ([name, bytes]) => {
            let match = every(bytes, (byte, i) => {
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
        let fd = openSync(this.path, 'r');
        readSync(fd, buff, 0, 4, 0);
        closeSync(fd);
        return File.getEncodingFromBuff(buff);
    }

    static get FileError () {
        return FileError;
    }

}

export default File;
