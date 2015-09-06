var util = require('util'),
    Transform = require('stream').Transform,
    packet = require('./struct');

function vNetReader(options) {
	if (!(this instanceof vNetReader)) {
		return new vNetReader(options);
	}

	options = options || {};

	Transform.call(this, options);

	this._filterPort = options.filter;
	this._header = undefined;
}

util.inherits(vNetReader, Transform);

vNetReader.prototype._createParser = function() {
	var parser = packet.createParser();
	parser.extract('header', this._doHeader.bind(this));

	return parser;
};

vNetReader.prototype._transform = function(data, encoding, callback) {
	var remaining = new Buffer(data);
	while(remaining.length > 0) {
		var parser = this._createParser();
		parser.parse(remaining);
		if (this._header) {
			var payload = remaining.slice(parser.length, this._header.eLength);
			remaining = remaining.slice(this._header.eLength);

			if (!this._filterPort || this._header.port == this._filterPort) {
				this.push(payload);
			}
			this._header = undefined;
		}
	}
	callback();
};

vNetReader.prototype._doHeader = function(header) {
	this._header = header;
};

module.exports = vNetReader;