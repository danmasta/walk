const Walk = require('./lib/walk');
const walk = Walk.factory();

exports = module.exports = walk;
exports.walk = walk;
exports.Walk = Walk;
