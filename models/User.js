var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
	name: {
		type: String,
		min: 3,
		required: true
	},
	password: {
		type: Buffer,
		required: true
	},
	admin: {
		type: Boolean,
		required: true
	}
}));