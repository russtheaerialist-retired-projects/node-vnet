var util = require('util'),
    Transform = require('stream').Transform,
    packet = require('./struct');

function vNetWriter(options) {
	if (!(this instanceof vNetWriter)) {
		return new vNetWriter(options);
	}

	options = options || {};
	options.writableObjectMode = true;

	Transform.call(this, options);
}

util.inherits(vNetWriter, Transform);

vNetWriter.prototype._transform = function (data, encoding, callback) {
	this.push(this._createPacket(data));
	callback();
};

vNetWriter.prototype._createPacket = function (data) {
	if (!data.payload) {
		throw new Error('Payload cannot be empty');
	}

	var port = data.port || 0x17, // default to MaCao
	    finalDest = data.finalDest || [ 0, 0 ],
	    origDest = data.origDest || [ 0, 0 ],
	    payload = data.payload;

	    finalDest = finalDest[0] | finalDest[1] << 8;
	    origDest = origDest[0]  | origDest[1] << 8;

	var serializer = packet.createSerializer();
	var length = 7 + payload.length;
	serializer.serialize('header', length, length-1, port, finalDest, origDest);
	
	var buf = new Buffer(length);
	serializer.write(buf);
	payload.copy(buf, 7, 0, payload.length);

	return buf;
};

module.exports = vNetWriter;