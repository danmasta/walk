# Walk
Directory and file walking utility for node apps

#### Features:
* Easy to use
* Simple, lightweight, and fast
* Native esm and cjs support
* Support for filtering with glob pattern matching
* Support for require-style path resolving
* Include and exclude pattern matching options
* Normalized [`File`](#file-objects) objects with helper methods
* Includes async and sync api
* Supports multiple interfaces:
    * `Readable Stream`
    * `Promise`
    * `Iterable`
    * `AsyncIterable`
    * `Generator`
    * `AsyncGenerator`
    * Iteration helpers: `each`, `map`, `tap`
* 1 external dependency

## About
I needed a better way to walk directories and read files during build and/or run time. I wanted an api that was simple, supported glob pattern matching, and returned objects with a similar format as vinyl. This package allows you to simply read any directory (or file), filter results with glob pattern matching, and return an array of [`File`](#file-objects) objects.

## Usage
Add walk as a dependency for your app and install via npm
```sh
npm install walk@danmasta/walk --save
```
Install a specific [version](https://github.com/danmasta/walk/tags)
```sh
npm install walk@danmasta/walk#v0.0.1 --save
```
Import or require the package in your app
```js
import walk from 'walk';
```

### Options
Name | Type | Description
-----|----- | -----------
`cwd` | *`string`* | Base directory to start walk from. Default is `process.cwd`
`root` | *`string`* | Root directory or file to walk from. This affects the relative paths used in [`File`](#file-objects) objects and matching. Default is `.`
`src` | *`string\|string[]`* | [Picomatch pattern](https://github.com/micromatch/picomatch#picomatch-1) for result filtering by including matches. Can be a path string, glob pattern string, or an array of strings. Defaults to `*(../)*(**/)*`
`ignore` | *`string\|string[]`* | [Picomatch pattern](https://github.com/micromatch/picomatch#picomatch-1) for result filtering by excluding matches. Can be a path string, glob pattern string, or an array of strings. Defaults to `*(../)*(**/)(.git\|node_modules)`
`bash` | *`boolean`* | Enable following bash matching rules more strictly (disallow backslashes as escape characters, and treat single stars as globstars `**`). Default is `false`
`dot` | *`boolean`* | Whether or not to include dot files when matching. Default is `true`
`posix` | *`boolean`* | Support posix character classes (brackets) when matching. Default is `false`
`regex` | *`boolean`* | Support regular expression rules for `+`, and stars `*` that follow parenthesis or brackets when matching. Default is `false`
`encoding` | *`string\|null`* | Which encoding to use when reading and writing File contents. Default is `utf8`
`require` | *`boolean`* | Enable using `require.resovle` to resolve paths if not found. Default is `false`
`paths` | *`string\|string[]`* | Which paths to walk to find files. Default is `undefined`
`include` | *`function`* | Custom function to use for path matching for including files. Function will receive 1 argument `path` and should return a `boolean`. Default is `undefined`
`exclude` | *`function`* | Custom function to use for path matching for excluding files. Function will receive 1 argument `path` and should return a `boolean`. Default is `undefined`

### Methods
Name | Description
-----|------------
`each(fn)` | Run an iterator function for each file. Returns a promise that resolves with the `Walk` instance if `fn` is async. Otherwise returns the `Walk` instance
`map(fn)` | Run an iterator function for each file. Returns a promise that resolves with an array of return values if `fn` is async. Otherwise returns an array of return values
`tap(fn)` | Run an iterator function for each file. Returns a promise that resolves with an `array` of File objects if `fn` is async. Otherwise returns an array of File objects
`promise()` | Returns a promise that resolves with an `array` of File objects
`[Symbol.asyncIterator]()` | Returns an [`AsyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)
`[Symbol.iterator]()` | Returns a regular synchronus [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)
`generator()` | Returns an [`AsyncGenerator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
`generatorSync()` | Returns a regular synchronous [`Generator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)

## File Objects
Each `File` object returned from walk has the following signature:
### Properties
Name | Type | Description
-----|----- | -----------
`cwd` | *`string`* | Current working directory. Default is `process.cwd`
`root` | *`string`* | Base directory to use for relative pathing. Default is `cwd`
`path` | *`string`* | Absolute path of file on disk
`relative` | *`string`* | Relative path to file from `root`
`relativeFromCwd` | *`string`* | Relative path to file from `cwd`
`dir` | *`string`* | Parent directory where file is located
`base` | *`string`* | File name with extension
`name` | *`string`* | File name without extension
`ext` | *`string`* | File extension
`stat` | *`object`* | The [`fs.stat`](https://nodejs.org/api/fs.html#fs_class_fs_stats) object for file. Default is `undefined`
`contents` | *`string\|object`* | Contents of file. Default is `undefined`
`encoding` | *`string`* | Default encoding to use when reading or writing file contents. Default is `utf8`

### Methods
name | description
-----| -----------
[`createReadStream(opts)`](https://nodejs.org/api/fs.html#fscreatereadstreampath-options) | Returns a `Readable` stream for File
[`createWriteStream(opts)`](https://nodejs.org/api/fs.html#fscreatewritestreampath-options) | Returns a `Writable` stream for File
[`append(data, opts)`](https://nodejs.org/api/fs.html#fspromisesappendfilepath-data-options) | Append data to File
[`appendSync(data, opts)`](https://nodejs.org/api/fs.html#fsappendfilesyncpath-data-options) | Synchronous alias for `append`
[`read(opts)`](https://nodejs.org/api/fs.html#fspromisesreadfilepath-options) | Read File contents. Returns `string` or `buffer` based on encoding
[`readSync(opts)`](https://nodejs.org/api/fs.html#fsreadfilesyncpath-options) | Synchronous alias for `read`
`readAsString(opts)` | Shortcut for `read` that verifies encoding is set or throws an error
`readAsStringSync(opts)` | Synchronous alias for `readAsString`
`readAsBuffer(opts)` | Shortcut for `read` that sets the encoding to `null`
`readAsBufferSync(opts)` | Synchronous alias for `readAsBuffer`
`readStr` | Alias for `readAsString`
`readStrSync` | Alias for `readAsStringSync`
`readBuf` | Alias for `readAsBuffer`
`readBufSync` | Alias for `readAsBufferSync`
[`write(data, opts)`](https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options) | Write data to File
[`writeSync(data, opts)`](https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options) | Synchronous alias for `write`
`require()` | Read File contents using `require`. Returns an `object`
`import()` | Read File contents using `import`. Returns a `promise`
`importOrRequire()` | Read File contents using `import` or `require` based on esm-ness. Returns a `promise` if `imported`, or an `object` if `required`
`importRequireOrRead()` | Read File contents using `import` or `require` if able, otherwise read as `string` or `buffer` based on encoding. Returns a `promise`
`isModule()` | Returns `true` if `contents` is a [`Module`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object)
`isBuffer()` | Returns `true` if `contents` is a [`Buffer`](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_isbuffer_obj)
`isStream()` | Returns `true` if `contents` is a [`Stream`](https://nodejs.org/api/stream.html)
`isNull()` | Returns `true` if `contents` is `null`
`isNil()` | Returns `true` if `contents` is `null` or `undefined`
`isString()` | Returns `true` if `contents` is a `string`
`isDirectory()` | Returns `true` if File is a [directory](https://nodejs.org/api/fs.html#fs_stats_isdirectory)
`isSymbolicLink()` | Returns `true` if File is a [symbolic link](https://nodejs.org/api/fs.html#fs_stats_issymboliclink)
`isBlockDevice()` | Returns `true` if File is a [block device](https://nodejs.org/api/fs.html#fs_stats_isblockdevice)
`isCharacterDevice()` | Returns `true` if File is a [character device](https://nodejs.org/api/fs.html#fs_stats_ischaracterdevice)
`isFIFO()` | Returns `true` if File is a [first-in-first-out (FIFO) pipe](https://nodejs.org/api/fs.html#fs_stats_isfifo)
`isFile()` | Returns `true` if File is a [file](https://nodejs.org/api/fs.html#fs_stats_isfile)
`isSocket()` | Returns `true` if File is a [socket](https://nodejs.org/api/fs.html#fs_stats_issocket)
`isEmpty()` | Returns `true` if File is empty (zero bytes)
`getEncodingFromBOM()` | Returns encoding from the File [Byte Order Mark](https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding) if set, otherwise `undefined`
`getEncodingFromBOMSync()` | Synchronous alias for `getEncodingFromBOM`

## Examples
```js
import walk from 'walk';
```
#### Walk the current working directory as `Readable` stream, pipe all Files to a destination stream
```js
walk().pipe(...);
```
#### Walk the current working directory, exclude all `.json` Files, return a promise
```js
walk({ src: '**/*.!(json)' }).promise().then(files => {
    ...
});
```
#### Walk a child directory, include only `.json` Files, return a promise
```js
walk('config', { src: '**/*.json' }).promise().then(files => {
    ...
});
```
#### Use `async/await`
```js
let files = await walk().promise();
```
#### Iterate synchronously using `for...of`
```js
for (const file of walk()) {
    ...
}
```
#### Iterate asynchronously using `for await...of`
```js
for await (const file of walk()) {
    ...
}
```
#### Iterate synchronously with a `Generator`
```js
for (const file of walk().generatorSync()) {
    ...
}
```
#### Iterate asynchronously with an `AsyncGenerator`
```js
for await (const file of walk().generator()) {
    ...
}
```
#### Iterate asynchronously using the built in `map` iteration method:
```js
const files = await walk().map(async file => {
    file.contents = await file.read();
    return file;
});
```
*Note: The built in iteration methods `each`, `map`, and `tap` can be awaited by passing an `async` iterator fn. If a regular function is passed they will iterate synchronously*

#### Iterate synchronously using the built in `tap` iteration method:
```js
const files = walk().tap(file => {
    file.contents = file.readBufSync();
});
```
#### Get a list of files as an array, synchronously
```js
import { sync as walk } from 'walk';
const files = walk('src');
```
#### Walk directory using an absolute path
```js
walk('/usr/local').promise().then(files => {
    ...
});
```
#### Read the contents of all `pug` files in the `views` directory as a `string`
```js
await walk('views', { src: '**/*.pug' }).tap(async file => {
    let tpl = await file.readStr();
});
```
#### Import all `js` files in the `routes` directory
```js
await walk('routes', { src: '**/*.js' }).each(async route => {
    app.use(await route.import());
});
```

## Testing
Tests are currently run using mocha and chai. To execute tests run `make test`. To generate unit test coverage reports run `make coverage`

## Contact
If you have any questions feel free to get in touch
