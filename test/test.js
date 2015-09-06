var vNet = require('../vnet'),
    tap = require('tap'),
    stream = require('stream'),
    streamBuf = require('stream-buffers');

var samplePacket = [ 0x0C, 0x0B, 0x17, 0x11, 0x00, 0x12, 0x00, 0x05, 0x6D, 0x02, 0xCB, 0x08 ];
var wrongPortPacket = [ 0x0C, 0x0B, 0x18, 0x11, 0x00, 0x12, 0x00, 0x05, 0x6D, 0x02, 0xCB, 0x08 ];

tap.test('vnet construction', function (t) {
	var vnet = new vNet();
	t.ok(vnet, 'vnet contructor must not fail');
	t.ok(vnet instanceof vNet, 'vnet constructor must return a vNet object');

	t.end();
});

tap.test('vnet is a transform stream', function (t) {
	var vnet = new vNet();
	t.ok(vnet instanceof stream.Transform, 'vnet must be a transform stream');

	t.end();
});

tap.test('vnet header must be stripped off of the header', function (t) {
	var vnet = new vNet(),
	    input = new streamBuf.ReadableStreamBuffer({
	    	frequency: 100
	    }),
	    output = new streamBuf.WritableStreamBuffer();

	input.put(new Buffer(samplePacket));
	input.pipe(vnet).pipe(output);
	input.destroySoon();

	input.on('end', function () {
		var actual = output.getContents();
		t.ok(samplePacket.length-7 == actual.length, 'header should be 7 bytes');

		t.end();

	});

});

tap.test('vnet filters on port', function (t) {
	var vnet = new vNet({filter: 0x17}),
	    input = new streamBuf.ReadableStreamBuffer({
	    	frequency: 100
	    }),
	    output = new streamBuf.WritableStreamBuffer();

	input.put(new Buffer(samplePacket));
	input.put(new Buffer(wrongPortPacket));
	input.pipe(vnet).pipe(output);
	input.destroySoon();

	input.on('end', function () {
		var actual = output.getContents();

		t.ok(actual.length == samplePacket.length-7, 'vnet did not filter bad port number');
		t.end();

	});

});