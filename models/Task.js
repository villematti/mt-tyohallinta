var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Task', new Schema({
	projectId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project',
		required: true
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	bigVisit: {
		type: Boolean,
		default: null
	},
	machineTime: {
		type: Number,
		default: null
	},
	dirtyWork: {
		type: Number,
		default: null
	},
	endedAt: {
		type: Date,
		default: null
	},
	hours: {
		type: Number,
		default: null
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