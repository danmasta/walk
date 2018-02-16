const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const File = require('./lib/file');
const util = require('./lib/util');

// convert fs apis to promises
const readdirAsync = Promise.promisify(fs.readdir);
const statAsync = Promise.promisify(fs.stat);
const readFileAsync = Promise.promisify(fs.readFile);

// walk directory asyncronously using promises
function walkDirAsync() {

    let opts = util.opts(...arguments);

    function walkdir(dir) {

        return util.concatMapAsync(readdirAsync(dir), name => {

            let abs = path.resolve(dir, name);

            return statAsync(abs).then(stat => {

                if (stat.isDirectory()) {

                    if (!opts.regex.test(name)) {
                        return walkdir(abs);
                    }

                } else {

                    let file = new File({ path: abs, stat: stat, cwd: opts.cwd, root: opts.root });

                    if (opts.matcher(file.relative || file.base)) {
                        return file;
                    }

                }

            });

        });

    }

    return walkdir(opts.root);

}


// walk async
function walk() {

    let opts = util.opts(...arguments);

    return statAsync(opts.root).then(stat => {

        if (stat.isDirectory()) {

            return walkDirAsync(opts);

        } else {

            let file = new File({ path: opts.root, stat: stat, cwd: opts.cwd, root: opts.root });

            if (opts.matcher(file.relative || file.base)) {
                return [file];
            } else {
                return [];
            }

        }

    }).catch(err => {

        opts.root = require.resolve(opts.root);

        return walk(opts);

    });

}

// walk directory syncronously
function walkDirSync() {

    let opts = util.opts(...arguments);

    function walkdir(dir) {

        return util.concatMap(fs.readdirSync(dir), name => {

            let abs = path.resolve(dir, name);
            let stat = fs.statSync(abs);

            if (stat.isDirectory()) {

                if (!opts.regex.test(name)) {
                    return walkdir(abs);
                }

            } else {

                let file = new File({ path: abs, stat: stat, cwd: opts.cwd, root: opts.root });

                if (opts.matcher(file.relative || file.base)) {
                    return file;
                }

            }

        });

    }

    return walkdir(opts.root);

}

//  walk sync
function walkSync() {

    let opts = util.opts(...arguments);
    let stat = null;

    try {

        stat = fs.statSync(opts.root);

    } catch (err) {

        opts.root = require.resolve(opts.root);

        return walkSync(opts);

    }

    if (stat.isDirectory()) {

        return walkDirSync(opts);

    } else {

        let file = new File({ path: opts.root, stat: stat, cwd: opts.cwd, root: opts.root });

        if (opts.matcher(file.relative || file.base)) {
            return [file];
        } else {
            return [];
        }

    }

}

// get file contents async
function contents() {

    let opts = util.opts(...arguments);

    return walk(opts).map(file => {

        if (opts.require) {

            file.contents = require(file.path);

            return file;

        } else {

            return readFileAsync(file.path, 'utf8').then(contents => {

                file.contents = contents;

                return file;

            });

        }

    });

}

// get file contents sync
function contentsSync() {

    let opts = util.opts(...arguments);

    return walkSync(opts).map(file => {

        if (opts.require) {

            file.contents = require(file.path);

            return file;

        } else {

            file.contents = fs.readFileSync(file.path, 'utf8');

            return file;

        }

    });

}

// run callback for each file async
function each(...args) {

    let cb = typeof args[args.length - 1] === 'function' ? args.pop() : file => {
        return file;
    };

    let opts = util.opts(...args);
    let fn = opts.read ? contents : walk;

    return fn.call(null, opts).map(cb);

}

// run callback for each file sync
function eachSync(...args) {

    let cb = typeof args[args.length - 1] === 'function' ? args.pop() : file => {
        return file;
    };

    let opts = util.opts(...args);
    let fn = opts.read ? contentsSync : walkSync;

    return fn.call(null, opts).map(cb);

}

// export api
exports.walk = walk;
exports.walkSync = walkSync;
exports.contents = contents;
exports.contentsSync = contentsSync;
exports.each = each;
exports.eachSync = eachSync;
