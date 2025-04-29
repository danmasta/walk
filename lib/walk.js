import { each, isObject, map, noop, tap } from 'lo';
import { Readable } from 'node:stream';
import { FileResolver } from './resolver.js';
import { NotFoundError, NotResolvedError, WalkError } from './util.js';

export class Walk extends Readable {

    constructor (paths, opts) {
        if (isObject(paths)) {
            [opts, paths] = [paths, opts];
        }
        if (!isObject(opts)) {
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

    map (fn=file=>file) {
        return map(this, fn);
    }

    tap (fn=noop) {
        return tap(this, fn);
    }

    each (fn=noop) {
        return each(this, fn);
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
        return WalkError;
    }

    static get NotFoundError () {
        return NotFoundError;
    }

    static get NotResolvedError () {
        return NotResolvedError;
    }

    static get Resolver () {
        return FileResolver;
    }

}

export default Walk;
