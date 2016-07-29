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
var Customer = require('./models/Customer');
var Tasktype = require('./models/Tasktype');
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

apiRoutes.post('/auth', function(req, res) {

	req.setEncoding('utf8');
	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

		if(err) return res.json({message: "Error!"});

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

// Create new user
apiRoutes.post('/users', function(req, res) {
	console.log(req.body.name);
	User.findOne({
		name: req.body.name
	}, function(err, userData) {
		if(err) return next(err);
		console.log(userData);
		if(userData) {
			res.json({ success: "Failure",
			message: "Username is already in use." });
		} else {

			if(typeof req.body.name == 'string' && typeof req.body.password == 'string') {
				// create user model
				var newUser = new User({
					name: req.body.name,
					password: password.hashPwd(req.body.password),
					admin: req.body.admin
				});

				newUser.save(function(err) {
					if(err) {
						res.json(err);
					} else {
						console.log('User succesfully created!');
						res.json({ success: "Success" });
					}
				
				});
			} else {
				res.json({success: "Failure",
					message: "Aren't stirngs!"
				});
			}

			
		}
	});
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

// ROUTES FOR CUSTOMERS

// Find customers
apiRoutes.get('/customers', function(req, res, next) {
	Customer.find({}, function(error, results) {
		if(error) return next(error);

		res.json(results);
	})
});

// Find spesific customer
apiRoutes.get('/customer/:id', function(req, res, next) {
	Customer.findOne({ _id: req.params.id}, function(error, customer) {
		if(error) return next(error);

		res.json(customer);
	});
});

// Add new customer
apiRoutes.post('/customers', function(req, res, next) {
	Customer.findOne({ name: req.body.name }, function(err,customer) {

		if(customer) {
			res.json({ success: "Failure",
			message: "Customer of this name has already been created." });
		} else {
			var newCustomer = new Customer({
				name: req.body.name
			});

			newCustomer.save(function(error) {
				if(error) return error;

				res.json({ success: "Success", message: "New customer was succesfully created!" });
			})
		}
	});
});

// Delete spesific customer
apiRoutes.delete('./customer/:id/delete', function(req, res, next) {
	Project.findOne({ customerId: req.params.id }, function(error, project) {
		if(project) {
			res.json({ success: "Failure",
			message: "Customer is associated with a project already. It can not be deleted." });
		} else {
			Customer.findByIdAndRemove(req.params.id, function(err) {
				if(err) return next(err);

				res.json({ success: "Success", message: "Customer has been deleted!" });
			})
		}
	})
})

// Update spesific customer
apiRoutes.put('/customer/:id', function(req, res, next) {

	Customer.update({ _id: req.params.id }, {
		$set: { name: req.body.name, modifiedAt: Date.now() }},
		function(error, result) {
			if(error) return next(error);

			res.json(result);
		}
	)
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
	console.log(req.body);
	if(req.body.customerId !== '' && req.body.name !== '' && req.body.number !== '' && req.body.statusId !== '') {
		console.log("We get here!");
		Customer.findOne({_id: req.body.customerId}, function(error, customer) {
			if(error) return next(error);

			if(customer) {
				var projectName = req.body.number + '-' + customer.name + '-' + req.body.name;

				Project.findOne({ name: projectName }, function(err, project) {
					if(err) return next(err);

					if(project) {
						res.json({ success: "Failure", message: "Project name is already in use." });
					} else {
						var newProject = new Project({
							name: projectName,
							statusId: req.body.statusId
						});

						newProject.save(function(err) {
							if(err) return next(err);

							res.json({ success: "Success", message: "Project was successfully created." });
						});
					}
				});
		} else {
			res.json({ success: "Failure", message: "Invalid customer." });
		}
	});


	} else {
		res.json({ success: "Failure", message: "Fill out all fields." });
	}
});

// ROUTES FOR USERS

// Find all users
apiRoutes.get('/users', function(req, res, next) {
	User.find({}, function(err, users) {
		if(err) return next(err);

		res.json(users);
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

// 2nd version of editing task
apiRoutes.put('/task/:id/edit', function(req, res, next) {

	var update = {};

	Task.findOne({ _id: req.params.id}, function(err, foundTask) {
		if(err) return next(err);

		Project.findOne({_id: req.body.values.projectId}, function(projectError, project) {

			if(project) {
				foundTask.projectId = project._id;

				User.findOne({ _id: req.body.values.userId }, function(userError, user) {

					if(user) {

						foundTask.userId = user._id;

						Tasktype.findOne({ _id: req.body.values.taskTypeId}, function(taskTypeError, taskType) {

							if(taskType) {

								foundTask.taskTypeId = taskType._id;

								foundTask.bigVisit = req.body.values.bigVisit;
								foundTask.machineTime = req.body.values.machineTime;
								foundTask.dirtyWork = req.body.values.dirtyWork;
								foundTask.overtime = req.body.values.overtime;

								if(req.body.end) {

									foundTask.endedAt = Date.now();
									var startTime = Date.parse(foundTask.createdAt);
									var elapsetTime = Date.now() - startTime;
									var hours = (((elapsetTime / 1000) / 60) / 60);
									foundTask.hours = hours;
								}

								foundTask.save(function(result) {
									res.json(result);
								})

							} else {
								res.json({ success: false, message: "Invalid tasktype!" });
							}
						})
					} else {
						res.json({ success: false, message: "Invalid user!" });
					}
				})
			} else {
				res.json({ success: false, message: "Invalid project number!" });
			}
		})		
	});
})

// Update spesific task
apiRoutes.put('/task/:id', function(req, res, next) {
	console.log(req.body);
	var update = {};

	Task.findOne({ _id: req.params.id}, function(err, foundTask) {
		if(err) return next(err);

		foundTask.projectId = req.body.projectId;
		foundTask.userId = req.body.userId;
		foundTask.bigVisit = req.body.bigVisit;
		foundTask.machineTime = req.body.machineTime;
		foundTask.dirtyWork = req.body.dirtyWork;
		foundTask.overtime = req.body.overtime;
		foundTask.taskTypeId = req.body.taskTypeId;

		if(req.body.end) {

			foundTask.endedAt = Date.now();
			var startTime = Date.parse(foundTask.createdAt);
			var elapsetTime = Date.now() - startTime;
			var hours = (((elapsetTime / 1000) / 60) / 60);
			foundTask.hours = hours;
		}

		console.log(foundTask);

		foundTask.save(function(result) {
			res.json(result);
		})
	});	

	
});


// Add new task
apiRoutes.post('/tasks', function(req, res, next) {
	console.log(req.body);
	var current = {};

	current.projectId = req.body.projectId;
	current.userId = req.body.userId;
	current.bigVisit = req.body.bigVisit;
	current.dirtyWork = req.body.dirtyWork;
	current.machineTime = req.body.machineTime;
	current.overtime = req.body.overtime;
	current.taskTypeId = req.body.taskTypeId;

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

	var criteria = {};

	if(req.body.activeProjects == true) {

		if(req.body.noTime == false) {
		criteria.createdAt = {'$gte': req.body.startDate, '$lte': req.body.endDate};
		}

		if(req.body.userId != 0) {
			criteria.userId = req.body.userId;
		}

		Status.findOne({name: "Pending"}, function(err, status) {
			if(err) return next(err);

			
			Project.find({statusId: status._id}, function(error, projects) {
				if(error) return next(error);

				var activeIds = [];
				
				for(var i=0; i<projects.length; i++) {

						activeIds.push(projects[i]._id)
				}

				Task.find(criteria)
					.where('projectId')
					.in(activeIds)
					.populate('userId')
					.populate('taskTypeId')
					.populate('projectId')
					.exec(function(e, results) {
						if(e) return next(e);

					res.json(results);
				});

			})

			

		})

	} else {

		if(req.body.noTime == false) {
		criteria.createdAt = {'$gte': req.body.startDate, '$lte': req.body.endDate};
		}

		if(req.body.userId != 0) {
			criteria.userId = req.body.userId;
		}

		if(req.body.projectId != 0 && req.body.activeProjects == false) {
			criteria.projectId = req.body.projectId;
		}

		if(req.body.noTime == true && req.body.userId == 0 && req.body.projectId == 0) {
			return next();
		}

		Task.find(criteria)
		.populate('userId')
		.populate('projectId')
		.populate('taskTypeId')
		.exec(function(error, results) {
			if(error) return next(error);

			res.json(results);
		});
	}

	

	
});

// Find last 5 tasks what belong to spesific user
apiRoutes.get('/tasks/user/:id/limit/:limit', function(req, res, next) {
	
	User.findOne({_id: req.params.id}, function(err, user) {
		if(err) return next(err);

		if(!user) {
			res.json({ success: false, message: "No user was not found!" })
		} else {
			Task.find({ userId: req.params.id })
				.sort({createdAt: -1})
				.limit(Number(req.params.limit))
				.populate('userId')
				.populate('projectId')
				.exec(function(err, results) {
					if(err) return next(err);

					res.json(results);
			});
		}
	})
});

apiRoutes.post('/tasks/user/:id/range',function(req, res, next){
	console.log(req.body);
	if(req.body.startDate != null && req.body.endDate != null) {
		User.findOne({_id: req.params.id}, function(err, user) {

			if(user) {
				var criteria = {};
				criteria.createdAt = {'$gte': req.body.startDate, '$lte': req.body.endDate};
				Task.find(criteria)
					.populate('projectId')
					.exec(function(error, results) {
						if(error, results) {
							if(error) return next(error);

							res.json(results);
						}
					})
			} else {
				res.send([]);
			}
		})
	} else {
		res.json({ success: "Failure", message: "You have to set the date range." })
	}

	
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

// Find spesific task, but don't populate
apiRoutes.get('/task/:id/nopopulate', function(req, res, next) {
	Task.findOne({_id: req.params.id})
		.exec(function(err, task) {
			if(err) return next(err);

			res.json(task);
		})
});

// Find spesific task
apiRoutes.get('/task/:id', function(req, res, next) {
	Task.findOne({_id: req.params.id})
		.populate('userId')
		.populate('projectId')
		.populate('taskTypeId')
		.exec(function(err, task) {
			if(err) return next(err);

			res.json(task);
		})
});

// TASKTYPES ROUTING

// Find all tasktypes
apiRoutes.get('/tasktypes', function(req, res, next) {
	Tasktype.find({}, function(error, results) {
		if(error) return next(error);

		res.json(results);
	})
})

// Create new tasktype
apiRoutes.post('/tasktypes', function(req, res, next) {
	Tasktype.findOne({name: req.body.name}, function(error, tasktype) {
		if(error) return next(error);

		if(tasktype) {
			res.json({success: false, message: "Tasktype name already in use."})
		} else {
			var newTaskType = new Tasktype({
				name: req.body.name
			});

			newTaskType.save(function(err) {
				if(err) return next(err);

				res.json({success: true, message: "New tasktype created succesfully!"});
			})
		}
	})
})

apiRoutes.delete('/tasktypes/:id/delete', function(req, res, next) {
	Task.findOne({taskTypeId: req.params.id}, function(err, task) {
		if(err) return next(err);

		if(task) {
			res.json({success: false, message: "This tasktype is already associated with a task and it cannot be deleted."});
		} else {
			Tasktype.findByIdAndRemove(req.params.id, function(error, result) {
				if(error) return next(error);

				res.json({ success: true, message: "Tasktype has been deleted!" });
			})
		}
	})
})

// Delete spesific tasktype

// CSV EXPORT ROUTES
apiRoutes.post('/export/tasks', function(req, res, next) {
	json2csv(req.body.data, function(err, csv) {
		if(err) return next(err);

		fs.writeFile('./public/export.csv', csv, 'ascii', function(error) {
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