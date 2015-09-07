var packet = require('packet');

var HEADER = 'b8 => eLength, b8 => length, b8 => port, l16 => finalDest, l16 => origDest';
var template = packet.createSerializer();
template.packet('header', HEADER);

module.exports = {
	createParser: function() {
		return template.createParser();
	},
	createSerializer: function() {
		return template.createSerializer();
	}
};
