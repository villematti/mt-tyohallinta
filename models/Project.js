var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Project', new Schema({
	name: {
		type: String,
		min: 3,
		required: true
	},
	displayName: {
		type: String,
		default: null
	},
	statusId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Status'
	},
	customerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Customer'
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