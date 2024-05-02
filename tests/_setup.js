const stream = require('stream');
const walk = require('../index');
const File = require('../lib/file');
const util = require('../lib/util');
const sync = require('../sync/index');

beforeEach(() => {
    return import('chai').then(chai => {
        global.assert = chai.assert;
        global.expect = chai.expect;
        global.should = chai.should();
        global.stream = stream;
        global.walk = walk;
        global.Walk = walk.Walk;
        global.File = File;
        global.util = util;
        global.sync = sync;
        global.Sync = sync.Walk;
    });
});
