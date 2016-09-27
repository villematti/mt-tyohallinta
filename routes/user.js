const Project = require('../models/Project');
const Settings = require('./../models/Settings');
const Type = require('./../models/Type');
const Customer = require('./../models/Customer');
const Task = require('./../models/Task');
const User = require('./../models/User');
var i18n = require('i18n');

module.exports = (router) => {
	router.get('/get-working-users', (req, res, next) => {
		Task.find({endedAt: null})
			.populate('userId')
			.populate('projectId')
			.exec((taskError, tasks) => {
				if(tasks.length > 0) {
					res.send(tasks);
				} else {
					res.json({ success: false, message: i18n.__('NO_WORKING_USERS') });
				}
		})
	})
}