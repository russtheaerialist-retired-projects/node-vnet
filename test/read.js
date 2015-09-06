var vNet = require('../vnet').createReader,
    vNetReader = require('../lib/reader'),
    tap = require('tap'),
    stream = require('stream'),
    streamBuf = require('stream-buffers'),
    testdata = require('./_data');


tap.test('vnet construction', function (t) {
	var vnet = vNet();
	t.ok(vnet, 'vnet contructor must not fail');
	t.ok(vnet instanceof vNetReader, 'vnet constructor must return a vNet object');

	t.end();
});

tap.test('vnet is a transform stream', function (t) {
	var vnet = vNet();
	t.ok(vnet instanceof stream.Transform, 'vnet must be a transform stream');

	t.end();
});

tap.test('vnet header must be stripped off of the header', function (t) {
	var vnet = vNet(),
	    input = new streamBuf.ReadableStreamBuffer({
	    	frequency: 100
	    }),
	    output = new streamBuf.WritableStreamBuffer();

	input.put(new Buffer(testdata.samplePacket));
	input.pipe(vnet).pipe(output);
	input.destroySoon();

	input.on('end', function () {
		var actual = output.getContents();
		t.ok(testdata.samplePacket.length-7 == actual.length, 'header should be 7 bytes');

		t.end();

	});

});

tap.test('vnet filters on port', function (t) {
	var vnet = vNet({filter: 0x17}),
	    input = new streamBuf.ReadableStreamBuffer({
	    	frequency: 100
	    }),
	    output = new streamBuf.WritableStreamBuffer();

	input.put(new Buffer(testdata.samplePacket));
	input.put(new Buffer(testdata.wrongPortPacket));
	input.pipe(vnet).pipe(output);
	input.destroySoon();

	input.on('end', function () {
		var actual = output.getContents();

		t.ok(actual.length == testdata.samplePacket.length-7, 'vnet did not filter bad port number');
		t.end();

	});

});
