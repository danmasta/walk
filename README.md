# Walk
Directory and file walking utility for node apps

Features:
* Easy to use
* Sync, async, streams, and promise api
* Simple filtering with glob pattern matching
* Require file contents or read as stream, buffer, or string
* Resolves require-style path strings
* Normalized file objects with helper methods
* Fast pattern matching via [micromatch](https://github.com/micromatch/micromatch)
* Include and exclude pattern matching options

## About
We needed a better way to walk directories and read files during build and/or start time. I wanted an api that was simple, supported glob pattern matching like gulp, and returned objects with a similar format as vinyl. This package allows you to simply read any directory (or file), return an array of objects, and filter results with glob pattern matching. It can also require file contents, read as strings, streams, or buffers, and resolve require-style path strings.

## Usage
Add walk as a dependency for your app and install via npm
```bash
npm install @danmasta/walk --save
```

Require the package in your app
```javascript
const walk = require('@danmasta/walk');
```

### Options
name | type | description
-----|----- | -----------
`cwd` | *`string`* | Base directory to start walk from. Default is `process.cwd`
`root` | *`string`* | Directory or file path as root to walk from. This gets normalized as `path.resolve(cwd, root)`. Default is `./`
`require` | *`boolean`* | If true, `file.contents` will be a resolved object using `require`. Default is `false`
`stream` | *`boolean`* | If true, `file.contents` will be a `Readable` stream. Default is `false`
`read` | *`boolean\|string`* | If `true`, will read file contents as a buffer or string. If string, accepts either 'require', 'stream', or 'contents'. Default is `false`
`sync` | *`boolean`* | Wether or not we are running in synchronous mode
`contents` | *`boolean`* | If true, will read file contents as string. Default is `false`
`buffer` | *`boolean`* | If true, when reading file conents, contents will remain a buffer instead of being converted to a string. Default is `false`
`src` | *`Array\|String\|RegExp`* | [Micromatch pattern](https://github.com/micromatch/micromatch#matcher) for result filtering by including any matches. Can be a path string, glob pattern string, regular expression, or an array of strings. Defaults to `*(../)*(**/)*`
`ignore` | *`Array\|String\|RegExp`* | [Micromatch pattern](https://github.com/micromatch/micromatch#matcher) for result filtering by ignoring any matches. Can be a path string, glob pattern string, regular expression, or an array of strings. Defaults to `*(../)*(**/)(.git|node_modules)`
`dot` | *`boolean`* | Whether or not to include dot files when matching. Default is `true`
`cb` | *`function`* | Function to call when flushing a file object. Default is `_.noop`

### Methods
Name | Description
-----|------------
`walk(path, opts)` | Get a list of files based on specified options. Returns a promise that resolves with an array of file objects
`walk.sync` | Sync version of `walk`. Returns an Array
`contents(path, opts)` | Get the contents of files based on specified options. Returns a promise that resolves with an array of file objects
`contents.sync` | Sync version of `contents`. Returns an Array
`each(path, opts, iteratee)` | Runs an iteratee function for each file based on specified options. Returns a promise that resolves with an array of file objects. Iteratee takes one argument [`file`](#file-objects)
`each.sync` | Sync version of `each`. Returns an Array
`require(path, opts)` | Get the contents of files by requiring them. Returns a promise that resolves with an array of file objects
`require.sync` | Sync version of `require`. Returns an Array
`stream(path, opts)` | Returns a read stream of file objects
`stream.sync` | Sync version of `stream`. Loads file data synchronously. Returns a read stream


*Each method takes an optional `path` and `options` param as arguments. The `each` methods also accept an iteratee function as the last argument*

## File Objects
Each file returned from walk has the following signature
### Properties
name | type | description
-----|----- | -----------
`cwd` | *`string`* | Current working directory. Defaults to `process.cwd`
`root` | *`string`* | Base directory to use for relative pathing. Defaults to `cwd`
`path` | *`string`* | Absolute path of the file on disk
`relative` | *`string`* | Relative path of file based from normalized `root`
`relativeFromCwd` | *`string`* | Relative path of file based from normalized `cwd`
`dir` | *`string`* | Parent directory where file is located
`base` | *`string`* | File name with extension
`name` | *`string`* | File name without extension
`ext` | *`string`* | File extension
`stat` | *`object`* | The [fs.stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) object for the file
`contents` | *`string\|object`* | Contents of the file. If `require` is `true`, will be resolved `object`, otherwise `string`. Default is `null`

### Methods
name | description
-----| -----------
`isBuffer` | Returns `true` if `file.contents` is a [`buffer`](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_isbuffer_obj)
`isStream` | Returns `true` if `file.contents` is a [`stream`](https://nodejs.org/api/stream.html)
`isNull` | Returns `true` if `file.contents` is `null`
`isString` | Returns `true` if `file.contents` is a `string`
`isDirectory` | Returns `true` if the file is a [directory](https://nodejs.org/api/fs.html#fs_stats_isdirectory)
`isSymbolic` | Returns `true` if the file is a [symbolic link](https://nodejs.org/api/fs.html#fs_stats_issymboliclink)


## Examples
### Walk
```js
const walk = require('@danmasta/walk');
```
Walk the current working directory, exclude all `.json` files
```js
walk('./', { src: '**/*.!(json)' }).then(res => {
    console.log('files:', res);
});
```
Walk a child directory, include only `.json` files
```js
walk('./config', { src: '**/*.json' }).then(res => {
    console.log('files:', res);
});
```
Walk a directory using an absolute path
```js
walk('/usr/local').then(res => {
    console.log('files:', res);
});
```

### Contents
Read the contents of all `pug` files in `./views`
```js
walk.contents('./views', { src: '**/*.pug' }).then(res => {
    console.log('templates:', res);
});
```

### Each
Require all `js` files in the `./routes` directory and run a callback for each one
```js
walk.each('./routes', { src: '**/*.js', require: true }, route => {
    app.use(route());
}).then(res => {
    console.log('all routes loaded');
});
```

### Synchronous Methods
To use the sync version of any method just append `.sync` to the end of the method name
```js
const walk = require('@danmasta/walk');
```
Load all templates from the `./views` directory
```js
const templates = walk.contents.sync('./views', { src: '**/*.pug' });
console.log('templates:', templates);
```

## Contact
If you have any questions feel free to get in touch
