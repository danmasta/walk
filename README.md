# Walk
Directory and file walking utility for node apps

Features:
* Easy to use
* Simple, lightweight, and fast
* Async, sync, streams, and promise api
* Simple filtering with glob pattern matching
* Require file contents or read as stream, buffer, or string
* Resolves require-style path strings
* Normalized file objects with helper methods
* Fast pattern matching via [micromatch](https://github.com/micromatch/micromatch)
* Include and exclude pattern matching options
* Only 2 dependencies: [micromatch](https://github.com/micromatch/micromatch), [lodash](https://github.com/lodash/lodash)

## About
I needed a better way to walk directories and read files during build and/or run time. I wanted an api that was simple, supported glob pattern matching like gulp, and returned objects with a similar format as vinyl. This package allows you to simply read any directory (or file), filter results with glob pattern matching, and return an array of file objects. It can also require file contents, read them as streams, buffers, or strings, and resolve require-style path strings.

## Usage
Add walk as a dependency for your app and install via npm
```bash
npm install @danmasta/walk --save
```

Require the package in your app
```javascript
const walk = require('@danmasta/walk');
```
*By default walk returns a readable stream interface. You can use the methods: `map()`, `each()`, and `promise()` to iterate file objects and return promises*

### Options
name | type | description
-----|----- | -----------
`cwd` | *`string`* | Base directory to start walk from. Default is `process.cwd`
`root` | *`string`* | Directory or file path as root to walk from. This affects the relative paths used in file objects and matching. Default is `./`
`src` | *`array\|string\|regexp`* | [Micromatch pattern](https://github.com/micromatch/micromatch#matcher) for result filtering by including any matches. Can be a path string, glob pattern string, regular expression, or an array of strings. Defaults to `*(../)*(**/)*`
`dot` | *`boolean`* | Whether or not to include dot files when matching. Default is `true`
`ignore` | *`array\|string\|regexp`* | [Micromatch pattern](https://github.com/micromatch/micromatch#matcher) for result filtering by ignoring any matches. Can be a path string, glob pattern string, regular expression, or an array of strings. Defaults to `*(../)*(**/)(.git\|node_modules)`
`encoding` | *`string`* | Which encoding to use when reading or writing file contents. Default is `utf8`
`resolve` | *`boolean`* | Whether or not to attempt to resolve file paths if not found. Default is `true`

### Methods
Name | Description
-----|------------
`map(fn)` | Runs an iterator function over each file. Returns a promise that resolves with a new `array`
`each(fn)` | Runs an iterator function over each file. Returns a promise that resolves with `undefined`
`promise` | Returns a promise that resolves with an `array` of file objects

### File Objects
Each file object returned from walk has the following signature:
#### Properties
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
`contents` | *`string\|object`* | Contents of the file. Default is `undefined`
`encoding` | *`string`* | Default encoding to use when reading or writing file contents. Default is `utf8`

#### Methods
name | description
-----| -----------
[`createReadStream(opts)`](https://nodejs.org/api/fs.html#fscreatereadstreampath-options) | Returns a readable stream for the file
[`createWriteStream(opts)`](https://nodejs.org/api/fs.html#fscreatewritestreampath-options) | Returns a writable stream for the file
[`append(data, opts)`](https://nodejs.org/api/fs.html#fspromisesappendfilepath-data-options) | Appends data to the file
[`read(opts)`](https://nodejs.org/api/fs.html#fspromisesreadfilepath-options) | Reads the file contents. Returns `string` or `buffer` based on encoding
`readAsString(opts)` | Shortcut for `read()` that ensures encoding is set or throws an error
`readAsBuffer(opts)` | Shortcut for `read()` that sets the encoding to `null`
`readStr` | Alias for `readAsString`
`readBuf` | Alias for `readAsBuffer`
[`write(data, opts)`](https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options) | Writes data to the file
`require` | Reads the file contents using `require`
`isBuffer` | Returns `true` if `file.contents` is a [`buffer`](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_isbuffer_obj)
`isStream` | Returns `true` if `file.contents` is a [`stream`](https://nodejs.org/api/stream.html)
`isNull` | Returns `true` if `file.contents` is `null`
`isString` | Returns `true` if `file.contents` is a `string`
`isDirectory` | Returns `true` if the file is a [directory](https://nodejs.org/api/fs.html#fs_stats_isdirectory)
`isSymbolic` | Returns `true` if the file is a [symbolic link](https://nodejs.org/api/fs.html#fs_stats_issymboliclink)
`isBlockDevice` | Returns `true` if the file is a [block device](https://nodejs.org/api/fs.html#fs_stats_isblockdevice)
`isCharacterDevice` | Returns `true` if the file is a [character device](https://nodejs.org/api/fs.html#fs_stats_ischaracterdevice)
`isFIFO` | Returns `true` if the file is a [first-in-first-out (FIFO) pipe](https://nodejs.org/api/fs.html#fs_stats_isfifo)
`isFile` | Returns `true` if the file is a [file](https://nodejs.org/api/fs.html#fs_stats_isfile)
`isSocket` | Returns `true` if the file is a [socket](https://nodejs.org/api/fs.html#fs_stats_issocket)
`isEmpty` | Returns `true` if the file is empty (zero bytes)
`getEncodingFromBOM` | Returns the encoding from the file [byte order mark](https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding) if set, otherwise `undefined`

### Sync
This package also supports a fully synchronous api. Instead of requiring the default package just require `@danmasta/walk/sync`. The api is exactly the same for walking and file objects

## Examples
```js
const walk = require('@danmasta/walk');
```
Walk the current working directory and pipe all files to a destination stream
```js
walk('./').pipe(writeStream());
```

Walk the current working directory, exclude all `.json` files
```js
walk('./', { src: '**/*.!(json)' }).promise().then(res => {
    console.log('files:', res);
});
```
Walk a child directory, include only `.json` files
```js
walk('./config', { src: '**/*.json' }).promise().then(res => {
    console.log('files:', res);
});
```
Walk a directory using an absolute path
```js
walk('/usr/local').promise().then(res => {
    console.log('files:', res);
});
```

Read the contents of all `pug` files in `./views` as a `string`
```js
walk('./views', { src: '**/*.pug' }).map(file => {
    file.readStr().then(res => {
        console.log('template:', file.path, res);
    });
});
```
Read the contents of all `pug` files in `./views` as a `buffer`
```js
walk('./views', { src: '**/*.pug' }).map(file => {
    file.readBuf().then(res => {
        console.log('template:', file.path, res);
    });
});
```

Require all `js` files in the `./routes` directory and run a callback for each one
```js
walk('./routes', { src: '**/*.js' }).each(route => {
    app.use(route.require());
}).then(() => {
    console.log('all routes loaded');
});
```

Load all templates from the `./views` directory synchronously
```js
const walk = require('@danmasta/walk/sync');

let templates = walk('./views', { src: '**/*.pug' });

console.log('templates:', templates);
```

## Testing
Tests are currently run using mocha and chai. To execute tests run `npm run test`. To generate unit test coverage reports run `npm run coverage`

## Contact
If you have any questions feel free to get in touch
