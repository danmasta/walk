const chai = require('chai');
const walk = require('../index');

beforeEach(function() {
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.should = chai.should();
    global.walk = walk;
});
