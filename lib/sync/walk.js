const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const WalkAsync = require('../walk');
const File = require('./file');

class Walk extends WalkAsync {

    constructor (...args) {
        super(...args);
    }

    _read () {
        if (!this.inFlight && !this.pending) {
            this.handleRead();
        }
    }

    handleRead () {
        if (this.canRead()) {
            this.readFromQueue();
            if (this.shouldRead) {
                this.handleRead();
            }
        } else {
            if (this.paths.length) {
                this.addPathIfExists(this.paths.shift());
                if (this.shouldRead) {
                    this.handleRead();
                }
            } else if (this.isEmpty()) {
                this.push(null);
            }
        }
    }

    addPathIfExists (str) {

        str = this.resolvePathFromHomeOrRoot(str);
        this.pending++;

        try {
            fs.accessSync(str, fs.constants.F_OK);
            this.pending--;
            this.pushToQueue(str);
        } catch (err) {

            if (this.opts.resolve) {
                try {
                    this.pending--;
                    this.pushToQueue(require.resolve(str));
                } catch (err) {
                    this.destroy(new Walk.NotResolvedError(str));
                }
            } else {
                this.pending--;
                this.destroy(new Walk.NotFoundError(str));
            }

        }

    }

    readDir (str) {

        this.inFlight++;

        let list = fs.readdirSync(str);

        _.each(list, name => {

            let abs = path.resolve(str, name);
            let rel = path.relative(this.opts.root, abs);

            if (!this.exclude || !this.exclude(rel)) {
                this.pushToQueue(abs);
            }

        });

        this.inFlight--;
        this.shouldRead = true;

    }

    addFile (str, stat) {

        this.inFlight++;

        let file = this.createFile(str, stat);

        if (!this.include || this.include(file.relative || file.base)) {
            this.push(file);
            this.shouldRead = false;
        } else {
            this.shouldRead = true;
        }

        this.inFlight--;

    }

    walkFileOrDir (str) {

        this.pending++;

        let stat = fs.statSync(str);

        this.pending--;
        if (stat.isDirectory()) {
            return this.readDir(str);
        } else {
            return this.addFile(str, stat);
        }

    }

    iterate (fn, res) {

        let file = null;

        // Handle errors during initialization
        // https://nodejs.org/api/stream.html#readableerrored
        // Note: we have to capture the error event before throwing or node
        // throws an uncaughtException and terminates the process - wtf
        // https://nodejs.org/api/events.html#error-events
        if (this.errored) {
            this.once('error', _.noop);
            throw this.errored;
        }

        while ((file = this.read(1))) {
            if (fn) {
                try {
                    file = fn(file);
                } catch (err) {
                    this.destroy(err);
                }
            }
            if (res) {
                res.push(file);
            }
        }

        // Handle errors during read
        if (this.errored) {
            this.once('error', _.noop);
            throw this.errored;
        }

        return res;

    }

    promise () {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.iterate(null, []));
            } catch (err) {
                reject(err);
            }
        });
    }

    run () {
        return this.iterate(null, []);
    }

    static factory () {
        let Fn = this;
        return function factory (...args) {
            return new Fn(...args).run();
        };
    }

    static get File () {
        return File;
    }

}

module.exports = Walk;
