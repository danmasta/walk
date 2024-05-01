const fs = require('fs');
const path = require('path');
const FileResolverAsync = require('../lib/resolver');
const File = require('./file');
const util = require('../lib/util');

class FileResolver extends FileResolverAsync {

    next () {
        if (this.isEmpty()) {
            return null;
        } else {
            let file;
            while ((file = this.readFromQueue()) === null) {
                if (this.isEmpty()) {
                    return null;
                }
            }
            return file;
        }
    }

    readFromQueue () {
        if (this.queue.length) {
            let path = this.queue.shift();
            return this.walkFileOrDir(path);
        }
        if (this.paths.length) {
            let path = util.resolvePathIfExistsSync(
                this.paths.shift(), this.opts.root, this.opts.resolve
            );
            return this.walkFileOrDir(path);
        }
        return null;
    }

    walkFileOrDir (str) {
        let stat = fs.statSync(str);
        if (stat.isDirectory()) {
            return this.readDir(str);
        } else {
            return this.readFile(str, stat);
        }
    }

    readDir (str) {
        let list = fs.readdirSync(str);
        util.each(list, base => {
            let abs = path.resolve(str, base), rel = path.relative(this.opts.root, abs);
            if (!this.isExcluded(rel)) {
                this.queue.push(abs);
            }
        });
        return null;
    }

    static get File () {
        return File;
    }

}

module.exports = FileResolver;
