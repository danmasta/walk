const fs = require('fs');
const FileAsync = require('../file');
const _ = require('lodash');

class File extends FileAsync {

    constructor (...args) {
        super(...args);
    }

    append (data, opts) {
        return fs.appendFileSync(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    read (opts) {
        return fs.readFileSync(
            this.path,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    readAsString (opts) {
        if ((!opts || opts && !opts.encoding) && !this.encoding) {
            throw new File.FileError('Encoding is required to read as string');
        } else {
            return this.read(opts);
        }
    }

    write (data, opts) {
        return fs.writeFileSync(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    getEncodingFromBOM () {

        let buff = Buffer.alloc(4);
        let enc = undefined;
        let fd = fs.openSync(this.path, 'r');

        fs.readSync(fd, buff, 0, 4, 0);
        fs.closeSync(fd);

        _.some(File.constants.BOM, (val, key) => {
            if (buff.indexOf(val) === 0) {
                return enc = key;
            }
        });

        return enc;

    }

}

module.exports = File;
