var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var crypto = require('crypto');
var password = require('./utils/password');
var json2csv = require('json2csv');
var fs = require('fs');

var jwt = require('jsonwebtoken');
var config = require('./config.js');
var cors = require('cors');

var helmet = require('helmet');
app.use(helmet());

// Databases
var User = require('./models/User');
var Status = require('./models/Status');
var Type = require('./models/Type');
var Project = require('./models/Project');
var Task = require('./models/Task');
mongoose.connect(config.database);
app.set('superSecret', config.secret);

var port = 3000;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.use('/assets', express.static(__dirname + '/public'));
app.use(cors());

// Protect API routes
var apiRoutes = express.Router();

apiRoutes.post('/auth', function(req, res, next) {

	req.setEncoding('utf8');
	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

		if(err) return next(err);

		if(!user) {
			res.json({ success: false, message: 'Authentication failed. User not found!'});			
		} else if(user) {

			if(req.body.password != "" && req.body.password != null) {

				// get encrypted password 
				var encrypted = password.hashPwd(req.body.password);

				// check if password matches
				if(user.password != encrypted) {
					res.json({ success: false, message: 'Authentication failed. Wrong password!'});
				} else {

					// if user is found and password is correct, create token
					var token = jwt.sign(user, app.get('superSecret'), {
						expiresIn: '1440m' // expires in 24h
					});

					res.json({
						success: true,
						message: 'Enjoy your token!',
						userid: user._id,
						token: token,
						admin: user.admin,
						username: user.name
					});
				}
			} else {
				res.json({
						success: false,
						message: 'Provide a password please'
					});
			}
		}
	})
});

// route middleware to veryfy a token
apiRoutes.use(function(req, res, next) {
	console.log(req.headers);
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['authorization'];

	// decode token
	if(token) {
		
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if(err) {
				return res.json({ success: false, message: 'Failed to authenticate token.'});
			} else {
				// if everything is good, save to requestfor use in other routes
				req.decode = decoded;
				next();
			}
		});
	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token found.'
		});s
	}
});


// ROUTES FOR STATUSES

// Find all statuses
apiRoutes.get('/statuses', function(req, res, next) {
	Status.find({}, function(error, results) {
		if(error) return next(error);

		res.json(results);
	});
});

// Find stautus by id
apiRoutes.get('/status/:id', function(req, res, next) {
	Status.findOne({ _id: req.params.id }, function(error, status) {
		if(error) return next(error);

		res.json(status);
	});
})

// Route for creating new status
apiRoutes.post('/statuses', function(req, res, next) {
	Status.findOne({ name: req.body.name }, function(err, status) {
		if(err) return next(err);

		if(status) {
			res.json({ success: "Failure",
			message: "Status of this name has already been created." });
		} else {
			var newStatus = new Status({
				name: req.body.name
			});
			newStatus.save(function(err) {
				if(err) return next(err);

				res.json({ success: "Success", message: "New status was succesfully created!" });
			});
		}
	});
});

apiRoutes.delete('/statuses/:id', function(req, res, next) {
	Project.findOne({statusId: req.params.id}, function(error, project) {
		if(error) return next(err);

		if(project) {

			res.json({ success: false, message: "Status is already asscosiated with one project at least."})
		} else {
			Status.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: "Status was deleted!" });
			})
		}
	});
});

// ROUTES FOR TYPES

// View all types
apiRoutes.get('/types', function(req, res, next) {
	Type.find({}, function(error, result) {
		if(error) return next(error);

		res.json(result);
	})
});

// Create new type
apiRoutes.post('/types', function(req, res, next) {
	Type.findOne({ name: req.body.name }, function(error, type) {
		if(error) return next(error);

		if(type) {
			res.json({ success: false, message: "Type whit that name alreade exists." });
		} else {
			var newType = new Type({
				name: req.body.name
			});

			newType.save(function(err) {
				if(err) return next(err);

				res.json({ success: true, message: "New type was created." })

			});
		}
	})
})

// Delete type
apiRoutes.delete('/types/:id', function(req, res, next) {
	Project.findOne({ typeId: req.params.id }, function(error, project) {
		if(project) {
			res.json({ success: false, message: "Type is associated with a project already." });
		} else {
			Type.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: "Type was deleted!" });
			})
		}
	})
})

// ROUTES FOR PROJECTS

// Get all projects
apiRoutes.get('/projects', function(req, res, next) {
	Project.find({})
		 .populate('statusId')
		 .exec(function(error, results) {
		 	if(error) return next(error);

		console.log(results);
		res.json(results);
		 });
});

// Update spesific project
apiRoutes.put('/projects/:id', function(req, res, next) {

	Project.update({ _id: req.params.id }, {
		$set: { name: req.body.name, statusId: req.body.statusId, modifiedAt: Date.now() }},
		function(error, result) {
			if(error) return next(error);

			res.json(result);
		}
	)
});

// Deleter spesific project
apiRoutes.delete('/project/:id', function(req, res, next) {
	Project.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: "Project was deleted!" });
			})

})

// Get spesific project
apiRoutes.get('/project/:id', function(req, res, next) {
	Project.findOne({_id: req.params.id})
		.populate('statusId')
		.exec(function(error, project) {
		if(error) return next(error);

		res.json(project);
	});
});

// Routes for creating new project
apiRoutes.post('/projects', function(req, res, next){
	Project.findOne({ name: req.body.name }, function(err, project) {
		if(err) return next(err);

		if(project) {
			res.json({ success: "Failure",
			message: "Project name is already in use." });
		} else {
			var newProject = new Project({
				name: req.body.name,
				statusId: req.body.statusId
			});

			newProject.save(function(err) {
				if(err) return next(err);
				console.log('Project was succesfully created!');
				res.json({ success: "Success" });
			});
		}
	});
});

// ROUTES FOR USERS

// Find all users
apiRoutes.get('/users', function(req, res, next) {
	User.find({}, function(err, users) {
		if(err) return next(err);

		res.json(users);
	});
});

// Create new user
apiRoutes.post('/users', function(req, res, next) {

	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if(err) return next(err);

		if(user) {
			res.json({ success: "Failure",
			message: "Username is already in use." });
		} else {
			// create user model
			var newUser = new User({
				name: req.body.name,
				password: password.hashPwd(req.body.password),
				admin: req.body.admin
			});

			newUser.save(function(err) {
			if(err) return next(err);

			console.log('User succesfully created!');
			res.json({ success: "Success" });
			});
		}
	});
});

apiRoutes.get('/users/:id', function(req, res, next) {
	var userId = req.params.id;
	User.findOne({_id: userId}, function(err, result) {
		if(err) return next(err);

		res.json(result);
	});
});

apiRoutes.get('/users', function(req, res, next) {
	User.find({}, function(err, results) {
		if(err) return next(err);

		res.json(results);
	})
});

apiRoutes.delete('/users/:id', function(req, res, next) {
	User.findByIdAndRemove(req.params.id, function(err, result) {
		if(err) return next(err);

		res.json({ success: "Success", message: "User was deleted!" });
	})
});

// ROUTES FOR TASKS

// Update spesific task
apiRoutes.put('/task/:id', function(req, res, next) {

	var update = {};

	Task.findOne({ _id: req.params.id}, function(err, foundTask) {
		if(err) return next(err);

		update.projectId = req.body.projectId;
		update.userId = req.body.userId;
		update.bigVisit = req.body.bigVisit;
		update.machineTime = req.body.machineTime;
		update.dirtyWork = req.body.dirtyWork;

		console.log(foundTask);

		if(req.body.end) {

			update.endedAt = Date.now();
			var startTime = Date.parse(foundTask.createdAt);
			var elapsetTime = Date.now() - startTime;
			var hours = (((elapsetTime / 1000) / 60) / 60);
			update.hours = hours;
		}

		Task.update({ _id: req.params.id }, {
		$set: update},
		function(error, result) {
			if(error) return next(error);

			res.json(result);
		}
	)

	});	

	
});

// Add new task
apiRoutes.post('/tasks', function(req, res, next) {

	var current = {};

	current.projectId = req.body.projectId;
	current.userId = req.body.userId;
	current.bigVisit = req.body.bigVisit;
	current.dirtyWork = req.body.dirtyWork;

	if(req.body.machineTime !== 0) {
		var setMachineTime = new Date();
		current.machineTime = req.body.machineTime;

		var timeToAdd = 60 * req.body.machineTime;

		current.endedAt = setMachineTime.setMinutes(setMachineTime.getMinutes() + timeToAdd);
		current.hours = timeToAdd / 60;
	
	} else {
		current.machineTime = req.body.machineTime;
	}

	var newTask = new Task(current);

	Task.findOne({userId: req.body.userId, endedAt: null}, function(error, task) {
			if(task) {
				newTask.save(function(err) {
					if(err) {
						return next(err);
					} else {

						var startTime = Date.parse(task.createdAt);
						var elapsetTime = Date.now() - startTime;
						var hours = (((elapsetTime / 1000) / 60) / 60);
						Task.update({_id: task._id,}, {
							$set: {endedAt: Date.now(), hours: hours}},
								function(error, result) {
								if(error) return next(error);

								res.json({ success: true, message: "New task has been created and last active has been ended." });
						});
					};
				});

			} else {
				newTask.save(function(err) {
					if(err) return next(err);

					res.json({ success: true, message: "New task has been created." })
				});
			}
	});
});

// Delete spesific task
apiRoutes.delete('/task/:id', function(req, res, next) {
	Task.findByIdAndRemove(req.params.id, function(err, result) {
		if(err) return next(err);

		res.json({ success: true, message: "Task was deleted!" });
	})
});

// Get all tasks from every user.
apiRoutes.post('/tasks/all', function(req, res, next) {

	var criteria = { createdAt: {'$gte': req.body.startDate, '$lte': req.body.endDate}}

	if(req.body.userId !== 0) {
		criteria.userId = req.body.userId;
	}

	console.log(new Date(req.body.startDate));
	console.log(new Date(req.body.endDate));

	Task.find(criteria)
		.populate('userId')
		.populate('projectId')
		.exec(function(error, results) {
			if(error) return next(error);

			res.json(results);
	});
});

// Find tasks what belong to spesific user
apiRoutes.get('/tasks/user/:id', function(req, res, next) {
	
	User.findOne({_id: req.params.id}, function(err, user) {
		if(err) return next(err);

		if(!user) {
			res.json({ success: false, message: "No was not found!" })
		} else {
			Task.find({ userId: req.params.id })
				.populate('userId')
				.populate('projectId')
				.exec(function(err, results) {
					if(err) return next(err);

					res.json(results);
			});
		}
	})
});

// Find spesific task
apiRoutes.get('/task/:id', function(req, res, next) {
	Task.findOne({_id: req.params.id})
		.populate('userId')
		.populate('projectId')
		.exec(function(err, task) {
			if(err) return next(err);

			res.json(task);
		})
});

// CSV EXPORT ROUTES
apiRoutes.post('/export/tasks', function(req, res, next) {
	json2csv(req.body.data, function(err, csv) {
		if(err) return next(err);

		fs.writeFile('./public/export.csv', csv, function(error) {
			if(error) return next(error);
			res.send({success: true, message: 'Export is ready. Donwload it at http://localhost:3000/assets/export.csv.'});
		});
	});
});

app.use('/api', apiRoutes);

// Entrypoint for the app frontend
app.get('/', function(req, res) {
	res.render('index');
});

app.listen(port);
console.log('Magic happens at http://localhost:' + port);