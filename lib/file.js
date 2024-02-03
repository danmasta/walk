const path = require('path');
const _ = require('lodash');
const util = require('./util');
const fs = require('fs');
const constants = require('./constants');

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

class FileError extends Error {
    constructor (str) {
        super(str);
        Error.captureStackTrace(this, FileError);
        this.name = 'FileError';
        this.code = 'FILEERROR';
    }
}

class File {

    constructor (opts) {

        _.defaults(this, opts, defaults);

        this.root = this.root ? util.stripTrailingSep(this.root) : this.cwd;

        if (!this.path && this.relative) {
            this.path = util.normalize(path.join(this.root, this.relative));
        }

        if (!this.path) {
            throw new File.FileError('Path or relative field is required');
        }

        this.relative = path.relative(this.root, this.path);
        this.relativeFromCwd = path.relative(this.cwd, this.path);
        this.dir = path.dirname(this.path);
        this.base = path.basename(this.path);
        this.ext = path.extname(this.path);
        this.name = path.basename(this.path, this.ext);

    }

    createReadStream (opts) {
        return fs.createReadStream(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    createWriteStream (opts) {
        return fs.createWriteStream(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    append (data, opts) {
        return fs.promises.appendFile(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    read (opts) {
        return fs.promises.readFile(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    readAsString (opts) {
        if ((!opts || opts && !opts.encoding) && !this.encoding) {
            return Promise.reject(new File.FileError('Encoding is required to read as string'));
        } else {
            return this.read(opts);
        }
    }

    readAsBuffer (opts) {
        return this.read(
            _.assign(opts, { encoding: null })
        );
    }

    readStr (...args) {
        return this.readAsString(...args);
    }

    readBuf (...args) {
        return this.readAsBuffer(...args);
    }

    write (data, opts) {
        return fs.promises.writeFile(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    require () {
        return require(this.path);
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

    isString () {
        return typeof this.contents === 'string';
    }

    isDirectory () {
        return this.stat && this.stat.isDirectory();
    }

    isSymbolic () {
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

    getEncodingFromBOM () {

        let buff = Buffer.alloc(4);
        let enc = undefined;

        return fs.promises.open(this.path, 'r').then(fd => {

            return fd.read(buff, 0, 4, 0).then(() => {
                return fd.close();
            });

        }).then(() => {

            _.some(File.constants.BOM, (val, key) => {
                if (buff.indexOf(val) === 0) {
                    return enc = key;
                }
            });

            return enc;

        });

    }

    static get FileError () {
        return FileError;
    }

    static get constants () {
        return constants;
    }

}

module.exports = File;
