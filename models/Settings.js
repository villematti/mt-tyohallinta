var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Settings', new Schema({
	name: {
		type: String,
		required: true
	},
	value: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	modifiedAt: {
		type: Date,
		required: true,
		default: Date.now
	}
}));