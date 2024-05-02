const fs = require('fs');
const FileAsync = require('../lib/file');
const util = require('../lib/util');
const { BOM } = require('../lib/constants');
const _ = require('lodash');

class File extends FileAsync {

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
            throw new util.FileError('Encoding is required to read as string');
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
        return fs.writeFileSync(
            this.path,
            data,
            _.defaults(opts, { encoding: this.encoding })
        );
    }

    getEncodingFromBom () {

        let buff = Buffer.alloc(4);
        let enc = undefined;
        let fd = fs.openSync(this.path, 'r');

        fs.readSync(fd, buff, 0, 4, 0);
        fs.closeSync(fd);

        _.some(BOM, (val, key) => {
            if (buff.indexOf(val) === 0) {
                return enc = key;
            }
        });

        return enc;

    }

}

module.exports = File;
