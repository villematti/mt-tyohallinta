const Project = require('../models/Project');
const Settings = require('./../models/Settings');
const Type = require('./../models/Type');
const Customer = require('./../models/Customer');
const Task = require('./../models/Task');
const User = require('./../models/User');

module.exports = (router) => {
	router.get('/get-todays-worked-hours', (req, res, next) => {
		var startOfToday = new Date();
		startOfToday.setHours(0,0,0,0);

		Task.find({userId: req.decode._doc._id, createdAt: { '$gte': startOfToday }},
			(taskError, tasks) => {
				if(taskError) {return next(taskError);}

			if(tasks) {
				res.send(tasks);
			} else {
				res.send("0.00h");
			}
		})
	})
} 