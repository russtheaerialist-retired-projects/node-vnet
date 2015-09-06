var reader = require('./lib/reader'),
    writer = require('./lib/writer');

// Temporary Shim for backwards compatibility, this shim will go away in 2.0
reader.createWriter = function(options) {
    return new writer(options);
};
reader.createReader = function(options) {
    return new reader(options);
};

module.exports = reader;
