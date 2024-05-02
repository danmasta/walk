const WalkAsync = require('../lib/walk');
const FileResolver = require('./resolver');
const File = require('./file');
const util = require('../lib/util');
const _ = require('lodash');

class Walk extends WalkAsync {

    _read () {
        if (!this.reading) {
            this.reading = true;
            let file;
            while ((file = this.resolver.next()) !== null) {
                if (!this.push(file)) {
                    this.reading = false;
                    break;
                }
            }
            if (file === null) {
                this.push(null);
            }
        }
    }

    iterate (fn, res) {

        let file;

        while ((file = this.resolver.next()) !== null) {
            if (fn) {
                file = fn(file);
            }
            if (res) {
                res.push(file);
            }
        }

        return res;

    }

    tap (fn) {
        return this.iterate(_.isFunction(fn) ? file => { fn(file); return file; } : file => file, []);
    }

    static factory () {
        let Fn = this;
        return function factory (...args) {
            return new Fn(...args).iterate(null, []);
        };
    }

    static get File () {
        return File;
    }

    static get FileResolver () {
        return FileResolver;
    }

}

module.exports = Walk;
