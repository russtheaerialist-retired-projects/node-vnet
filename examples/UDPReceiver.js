var reader = require('../vnet').createReader(),
    udp = require('dgram'), 
    stream = require('stream'),
    output = new stream.Writable();

reader.on('error', function(err) {
  console.log(err);
});

output._write = function(chunk, encoding, callback) {
	console.log(chunk);
	callback();
};

var socket = udp.createSocket('udp4', function (msg) {
  reader.write(msg);
});
socket.bind(230);

reader.pipe(output);
