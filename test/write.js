var vNet = require('../vnet').createWriter,
    vNetWriter = require('../lib/writer'),
    tap = require('tap'),
    stream = require('stream'),
    streamBuf = require('stream-buffers'),
    testdata = require('./_data');

tap.test('vnet construction', function (t) {
	var vnet = vNet();
	t.ok(vnet, 'vnet contructor must not fail');
	t.isA(vnet, vNetWriter, 'vnet constructor must return a vNet object');

	t.end();
});

tap.test('vnet is a transform stream', function (t) {
	var vnet = vNet();
	t.isA(vnet, stream.Transform, 'vnet must be a transform stream');

	t.end();
});

tap.test('createPacket serializes the data correctly', function (t) {
	var vnet = vNet();
	var actual = vnet._createPacket({
		port: 0x17,
		finalDest: [ 0x11, 0x00 ],
		origDest: [ 0x12, 0x00 ],
		payload: testdata.payload		
	});

	t.same(testdata.samplePacket, actual);

	t.end();
});

tap.test('vnet throws if you try to send without a payload', function (t) {
	t.plan(1);
	var vnet = vNet();

	t.throws(function () {
		vnet._createPacket({});
	});
});

tap.test('vnet must take objects', function (t) {
	var vnet = vNet(),
	    output = new streamBuf.WritableStreamBuffer(),
	    input = new stream.Readable({objectMode: true});

	input._read = function () {
		this.push({
			port: 0x17,
			finalDest: [ 0x11, 0x00 ],
			origDest: [ 0x12, 0x00 ],
			payload: testdata.payload
		});
		this.push(null);
	};

	input.pipe(vnet).pipe(output);
	input.on('end', function() {
		var actual = output.getContents();

	    t.same(actual, testdata.samplePacket, 'vnet generates expected packets');
		t.end();
	});

});