var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Project', new Schema({
	name: {
		type: String,
		min: 3,
		required: true
	},
	statusId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Status'
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