vNet Packet Streams
===================

[vNet](https://github.com/souliss/souliss/wiki/vNet%20Details) is a simple networking prototype over UDP used by [Souliss](https://github.com/souliss/souliss).

This is the node implementation to enable a Souliss gateway to be written in
node.

Reader Usage
------------

```javascript
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
```
