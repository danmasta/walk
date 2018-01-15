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
function walkDirAsync(opts, res = []) {

    opts = util.opts(opts);

    function walkdir(dir) {

        return readdirAsync(dir).map(name => {

            let abs = path.resolve(dir, name);

            return statAsync(abs).then(stat => {

                if (stat.isDirectory()) {

                    if (!opts.regex.test(name)) {
                        return walkdir(abs);
                    }

                } else {

                    let file = new File({ path: abs, stat: stat, cwd: opts.cwd, root: opts.root });

                    if (opts.matcher(file.relative || file.base)) {
                        return res.push(file);
                    }

                }

            });

        });

    }

    return walkdir(opts.root).return(res);

}

// walk directory syncronously
function walkDirSync(opts, res = []) {

    opts = util.opts(opts);

    function walkdir(dir) {

        return fs.readdirSync(dir).map(name => {

            let abs = path.resolve(dir, name);
            let stat = fs.statSync(abs);

            if (stat.isDirectory()) {

                if (!opts.regex.test(name)) {
                    return walkdir(abs);
                }

            } else {

                let file = new File({ path: abs, stat: stat, cwd: opts.cwd, root: opts.root });

                if (opts.matcher(file.relative || file.base)) {
                    return res.push(file);
                }

            }

        });

    }

    return walkdir(opts.root) && res;

}

// walk async
function walk(opts, res = []) {

    opts = util.opts(opts);

    return statAsync(opts.root).then(stat => {

        if (stat.isDirectory()) {

            return walkDirAsync(opts, res);

        } else {

            let file = new File({ path: opts.root, stat: stat, cwd: opts.cwd, root: opts.root });

            if (opts.matcher(file.relative || file.base)) {
                return res.push(file);
            }

        }

    }).return(res).catch(err => {

        opts.root = require.resolve(opts.root);

        return walk(opts, res);

    });

}

//  walk sync
function walkSync(opts, res = []) {

    opts = util.opts(opts);

    let stat = null;

    try {

        stat = fs.statSync(opts.root);

    } catch (err) {

        opts.root = require.resolve(opts.root);

        return walkSync(opts, res);

    }

    if (stat.isDirectory()) {

        return walkDirSync(opts, res);

    } else {

        let file = new File({ path: opts.root, stat: stat, cwd: opts.cwd, root: opts.root });

        if (opts.matcher(file.relative || file.base)) {
            res.push(file);
        }

        return res;

    }

}

// get file contents async
function contents(opts, res = []) {

    opts = util.opts(opts);

    return walk(opts, res).map(file => {

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
function contentsSync(opts, res = []) {

    opts = util.opts(opts);

    return walkSync(opts, res).map(file => {

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
function each(opts, cb) {

    opts = util.opts(opts);

    let fn = opts.read ? contents : walk;

    cb = typeof cb === 'function' ? cb : function (file) {
        return file;
    };

    return fn.call(null, opts).map(cb);

}

// run callback for each file sync
function eachSync(opts, cb) {

    opts = util.opts(opts);

    let fn = opts.read ? contentsSync : walkSync;

    cb = typeof cb === 'function' ? cb : function (file) {
        return file;
    };

    return fn.call(null, opts).map(cb);

}

// export api
exports.walk = walk;
exports.walkSync = walkSync;
exports.contents = contents;
exports.contentsSync = contentsSync;
exports.each = each;
exports.eachSync = eachSync;
