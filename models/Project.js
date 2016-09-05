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
	number: {
		type: String,
		required: true
	},
	year: {
		type: String,
		required: true
	},
	version: {
		type: String,
		default: '00'
	},
	typeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Type'
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