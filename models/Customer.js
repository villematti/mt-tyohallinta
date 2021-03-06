var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Customer', new Schema({
	name: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	modifiedAt: {
		type: Date,
		default: Date.now
	}
}));