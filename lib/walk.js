const Readable = require('stream').Readable;
const File = require('./file');
const FileResolver = require('./resolver');
const util = require('./util');
const _ = require('lodash');

class Walk extends Readable {

    constructor (paths, opts) {

        if (_.isPlainObject(paths)) {
            [opts, paths] = [paths, opts];
        }

        if (!_.isPlainObject(opts)) {
            opts = {};
        }

        if (!opts.paths) {
            opts.paths = paths;
        }

        super({ objectMode: true });

        this.reading = false;
        this.resolver = new this.constructor.FileResolver(opts);

    }

    async _read () {
        if (!this.reading) {
            this.reading = true;
            let file;
            while ((file = await this.resolver.next()) !== null) {
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

    async iterate (fn, res) {

        let file;

        while ((file = await this.resolver.next()) !== null) {
            if (fn) {
                file = await fn(file);
            }
            if (res) {
                res.push(file);
            }
        }

        return res;

    }

    map (fn) {
        return this.iterate(_.isFunction(fn) ? fn : file => file, []);
    }

    tap (fn) {
        return this.iterate(_.isFunction(fn) ? async file => { await fn(file); return file; } : file => file, []);
    }

    each (fn) {
        return this.iterate(_.isFunction(fn) ? fn : _.noop);
    }

    async promise () {
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

    static get WalkError () {
        return util.WalkError;
    }

    static get NotFoundError () {
        return util.NotFoundError;
    }

    static get NotResolvedError () {
        return util.NotResolvedError;
    }

    static get File () {
        return File;
    }

    static get FileResolver () {
        return FileResolver;
    }

}

module.exports = Walk;
