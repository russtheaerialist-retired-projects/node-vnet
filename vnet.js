var util = require('util'),
    Transform = require('stream').Transform,
    packet = require('packet');

var HEADER = 'b8 => eLength, b8 => length, b8 => port, b16 => finalDest, b16 => origDest'

function vNet(options) {
	if (!(this instanceof vNet)) {
		return new vNet(options);
	}

	options = options || {};

	Transform.call(this, options);

	this._filterPort = options.filter;
	this._header = undefined;
}

util.inherits(vNet, Transform);

vNet.prototype._createParser = function() {
	var parser = packet.createParser();
	parser.packet('header', HEADER);
	parser.extract('header', this._doHeader.bind(this));

	return parser;
}

vNet.prototype._transform = function(data, encoding, callback) {
	var remaining = new Buffer(data);

	while(remaining.length > 0) {
		var parser = this._createParser();
		parser.parse(remaining);
		if (this._header) {
			var dataSize = this._header.eLength - parser.length + 1;
			var payload = remaining.slice(parser.length, this._header.eLength);
			remaining = remaining.slice(this._header.eLength);

			if (!this._filterPort || this._header.port == this._filterPort) {
				this.push(payload);
			}
			this._header = undefined;
		}
	}
	callback();
}

vNet.prototype._doHeader = function(header) {
	this._header = header;
}

module.exports = vNet;