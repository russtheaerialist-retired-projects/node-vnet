var serializer = require('packet').createSerializer();

var HEADER = 'b8 => eLength, b8 => length, b8 => port, b16 => finalDest, b16 => origDest';
serializer.packet('header', HEADER);

module.exports = serializer;
