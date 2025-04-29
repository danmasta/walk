import { assert, expect, should } from 'chai';
import { File, sync, Walk, walk } from '../index.js';

const [file] = await walk('./index.js').promise();

beforeEach(() => {
    global.assert = assert;
    global.expect = expect;
    global.should = should();
    global.Walk = Walk;
    global.File = File;
    global.walk = walk;
    global.sync = sync;
    global.file = file;
});
