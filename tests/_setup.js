const path = require('path');
const chai = require('chai');
const walk = require('../index');
const File = require('../lib/file');
const util = require('../lib/util');
const stream = require('stream');

beforeEach(() => {
    global.path = path;
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.should = chai.should();
    global.walk = walk;
    global.File = File;
    global.util = util;
    global.stream = stream;
    global.testsFileCount = walk('./tests').sync().length;
});
