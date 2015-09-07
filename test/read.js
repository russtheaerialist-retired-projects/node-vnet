var vNet = require('../vnet').createReader,
vNetReader = require('../lib/reader'),
tap = require('tap'),
stream = require('stream'),
streamBuf = require('stream-buffers'),
testdata = require('./_data');

function constructVNet() {
	var vnet = vNet({filter: 0x17}),
	output = new streamBuf.WritableStreamBuffer();

	return { vnet: vnet, output: output, pipe: function() {
		vnet.pipe(output);
	}};
}

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
	var vnet = constructVNet();

	vnet.vnet.write(testdata.samplePacket);
	vnet.pipe();
	vnet.vnet.end();

	vnet.vnet.on('end', function () {
		var actual = vnet.output.getContents();
		t.ok(testdata.samplePacket.length-7 == actual.length, 'header should be 7 bytes');

		t.end();

	});

});

tap.test('vnet filters on port', function (t) {
	var vnet = constructVNet();

	vnet.vnet.write(testdata.samplePacket);
	vnet.vnet.write(testdata.wrongPortPacket);
	vnet.pipe();
	vnet.vnet.end();

	vnet.vnet.on('end', function () {
		var actual = vnet.output.getContents();

		t.ok(actual.length == testdata.payload.length, 'vnet did not filter bad port number');
		t.end();

	});

});

tap.test('vnet can receive multiple packets', function (t) {
	var vnet = constructVNet();
	vnet.vnet.write(testdata.samplePacket);
	vnet.vnet.write(testdata.samplePacket);
	vnet.vnet.write(testdata.samplePacket);
	vnet.pipe();
	vnet.vnet.end();
	vnet.vnet.on('end', function() {
		var actual = vnet.output.getContents();
		t.equals(actual.length, testdata.payload.length * 3, 'all packets should be received');
		t.end();
	});
});
