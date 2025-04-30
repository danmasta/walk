var lo = require('lo');
var node_stream = require('node:stream');
var resolver = require('./resolver.cjs');
var util = require('./util.cjs');
var errors = require('lo/errors');

class Walk extends node_stream.Readable {

    constructor (paths, opts) {
        if (lo.isObject(paths)) {
            [opts, paths] = [paths, opts];
        }
        if (!lo.isObject(opts)) {
            opts = {};
        }
        if (!opts.paths) {
            opts.paths = paths;
        }
        super({ ...opts, objectMode: true });
        this.reading = false;
        this.resolver = new this.constructor.Resolver(opts);
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

    each (fn = lo.noop) {
        return lo.each(this, fn);
    }

    map (fn=file=>file) {
        return lo.map(this, fn);
    }

    tap (fn=lo.noop) {
        return lo.tap(this, fn);
    }

    async promise () {
        return this.map(async file=>file);
    }

    [Symbol.asyncIterator] () {
        const { resolver } = this;
        return {
            async next () {
                const file = await resolver.next();
                if (file) {
                    return { value: file, done: false };
                }
                return { done: true };
            },
            async return () {
                resolver.end();
                return { done: true };
            },
            async throw () {
                resolver.end();
                return { done: true };
            }
        }
    }

    [Symbol.iterator] () {
        const { resolver } = this;
        return {
            next () {
                const file = resolver.next(true);
                if (file) {
                    return { value: file, done: false };
                }
                return { done: true };
            },
            return () {
                resolver.end();
                return { done: true };
            },
            throw () {
                resolver.end();
                return { done: true };
            }
        }
    }

    async *generator () {
        const { resolver } = this;
        let file;
        while ((file = await resolver.next())) {
            yield file;
        }
    }

    *generatorSync () {
        const { resolver } = this;
        let file;
        while ((file = resolver.next(true))){
            yield file;
        }
    }

    static factory (sync) {
        const Fn = this;
        return function factory (...args) {
            const walk = new Fn(...args);
            if (sync) {
                return walk.map();
            }
            return walk;
        };
    }

    static get WalkError () {
        return util.WalkError;
    }

    static get NotFoundError () {
        return errors.NotFoundError;
    }

    static get NotResolvedError () {
        return errors.NotResolvedError;
    }

    static get Resolver () {
        return resolver.FileResolver;
    }

}

exports.Walk = Walk;
exports.default = Walk;
