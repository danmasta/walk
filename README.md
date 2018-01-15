# Walk
File and directory walking utility for node apps

Features:
* Easy to use
* Sync and Async api
* Returns bluebird promises
* Simple filtering with glob pattern matching
* Doesn't use streams or events
* Require file contents or read them
* Can resolve require-style path strings
* Normalized file objects with helper methods
* Fast pattern matching via [micromatch](https://github.com/micromatch/micromatch)

## About
We needed a better way to walk directories and read files during build and/or start time. I wanted an api that was simple, supported glob pattern matching like gulp, and returned objects with a similar format as vinyl. This package allows you to simply read any directory (or file), return an array of objects, and filter results with glob pattern matching. It can also require file contents, and resolve require-style path strings.

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
`cwd` | *`string`* | Base directory to start walk from. Default is `process.cwd()`
`root` | *`string`* | Directory or file path to walk. This gets normalized as `path.join(cwd, root)`. Default is `/`
`exclude` | *`array`* | Array of directory names to exclude from walk. Defaults to `['.git', 'node_modules', 'bower_components']`. Directory names are excluded `before` reading them, this helps it stay fast
`require` | *`boolean`* | Whether to `require` file contents instead of reading them. Default is `false`
`read` | *`boolean`* | Whether to read require file contents when using `each()`. Defaults to `true`
`src` | *`Array|String|RegExp`* | [Micromatch pattern](https://github.com/micromatch/micromatch#matcher) for result filtering. Can be a path string, glob pattern string, regular expression, or an array of strings. Defaults to `**/*`
`dot` | *`boolean`* | Whether or not to ignore dot files when matching. Default is `true`

### Methods
Name | Description
-----|------------
`walk(opts)` | Get a list of files based on specified options. Returns a promise that resolves with an array of file objects
`walkSync(opts)` | Sync version of `walk()`
`contents(opts)` | Get the contents of files based on specified options. Returns a promise that resolves with an array of file objects
`contentsSync(opts)` | Sync version of `contents()`
`each(opts, cb)` | Runs a callback for each file based on specified options. Returns a promise that resolves with an array of file objects. Callback takes one argument `file`
`eachSync(opts, cb)` | Sync version of `each()`

## File Objects
Each file returned from walk has the following signature
### Properties
name | type | description
-----|----- | -----------
`cwd` | *`string`* | Current working directory. Defaults to `process.cwd()`
`root` | *`string`* | Base directory to use for relative pathing. Defaults to `process.cwd`
`path` | *`string`* | Absolute path of the file on disk
`relative` | *`string`* | Relative path of file based normalized from `root`
`dir` | *`string`* | Parent directory where file is located
`base` | *`string`* | File name with extension
`name` | *`string`* | File name without extension
`ext` | *`string`* | File extension
`stat` | *`object`* | The [fs.stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) object for the file
`contents` | *`string|object`* | Contents of the file. If `require` is `true`, will be resolved `object`, otherwise `string`. Default is `null`

### Methods
name | description
-----| -----------
`isBuffer` | Returns `true` if `file.contents` is a [`buffer`](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_isbuffer_obj)
`isStream` | Returns `true` if `file.contents` is a [`stream`](https://nodejs.org/api/stream.html)
`isNull` | Returns `true` if `file.contents` is `null`
`isDirectory` | Returns `true` if the file is a [directory](https://nodejs.org/api/fs.html#fs_stats_isdirectory)
`isSymbolic` | Returns `true` if the file is a [symbolic link](https://nodejs.org/api/fs.html#fs_stats_issymboliclink)


## Examples
### Walk
```js
const walk = require('@danmasta/walk').walk;
```
Walk the current directory, exclude all `.json` files
```js
walk({ src: '**/*.!(json)' }).then(res => {
    console.log('files:', res);
});
```
Walk a child directory, include only `.json` files
```js
walk({ root: './config', src: '**/*.json' }).then(res => {
    console.log('files:', res);
});
```

### Contents
```js
const contents = require('@danmasta/walk').contents;
```
Read the contents of all `pug` files in `./views`
```js
contents({ root: './views', src: '**/*.pug' }).then(res => {
    console.log('templates:', res);
});
```

### Each
```js
const each = require('@danmasta/walk').each;
```
Require all `js` files in the `./routes` directory and run a callback for each one
```js
each({ root: './routes', src: '**/*.js', require: true }, route => {
    app.use(route());
}).then(res => {
    console.log('all routes loaded');
});
```

### Synchronous Methods
To use the sync version of any method just append `Sync` to the end of the method name
```js
const contents = require('@danmasta/walk').contentsSync;
```
Load all templates from the `./views` directory
```js
const templates = contents({ root: './views', src: '**/*.pug' });
console.log('templates:', templates);
```

## Contact
If you have any questions feel free to get in touch
