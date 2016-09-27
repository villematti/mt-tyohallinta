var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var crypto = require('crypto');
var password = require('./utils/password');
var json2csv = require('json2csv');
var fs = require('fs');
var i18n = require('i18n');

i18n.configure({
	locales: ['fi_FI'],
	directory: __dirname + '/locales',
	defaultLocale: 'fi_FI',
	extension: '.json'
})

app.use(i18n.init);

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
var Settings = require('./models/Settings')
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

apiRoutes.get('/usernames', function(req, res) {
	var usernames = [];
	User.find({}, function(err, users) {
		users.map(function(user) {
			usernames.push(user.name);
		})
		res.send(usernames);
	})
})

apiRoutes.post('/auth', function(req, res) {

	req.setEncoding('utf8');
	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

		if(err) return res.json({message: i18n.__('ERROR')});

		if(!user) {
			res.json({ success: false, message: i18n.__('AUTH_FAILED')});			
		} else if(user) {

			if(req.body.password != "" && req.body.password != null) {

				// get encrypted password 
				var encrypted = password.hashPwd(req.body.password);

				// check if password matches
				if(user.password != encrypted) {
					res.json({ success: false, message: i18n.__('AUTH_FAILED_WRONG_PASSWORD')});
				} else {

					// if user is found and password is correct, create token
					var token = jwt.sign(user, app.get('superSecret'), {
						expiresIn: '1440m' // expires in 24h
					});

					var settingValues = {};

					Settings.find({}, (settingsError, settings) => {
						var settingsMap = settings.map((value) => {
							settingValues[value.name] = value.value;
							return true;
						})
						console.log(settings)

						res.json({
							success: true,
							message: i18n.__('ENJOY_TOKEN'),
							userid: user._id,
							token: token,
							admin: user.admin,
							pm: user.projectManager,
							username: user.name,
							settings: settingValues
						});
					})

					
				}
			} else {
				res.json({
						success: false,
						message: i18n.__('PROVIDE_PASSWORD')
					});
			}
		}
	})
});

// Create new user
apiRoutes.post('/users', function(req, res) {
	
	User.findOne({
		name: req.body.name
	}, function(err, userData) {
		if(err) return next(err);
		
		if(userData) {
			res.json({ success: "Failure",
			message:i18n.__('USERNAME_IN_USE') });
		} else {

			if(typeof req.body.name == 'string' && typeof req.body.password == 'string') {
				// create user model
				var newUser = new User({
					name: req.body.name,
					password: password.hashPwd(req.body.password),
					admin: req.body.admin,
					projectManager: req.body.pm
				});

				newUser.save(function(err) {
					if(err) {
						res.json(err);
					} else {
						res.json({ success: "Success" });
					}
				
				});
			} else {
				res.json({success: "Failure",
					message: i18n__('NO_STIRNGS')
				});
			}

			
		}
	});
});

// route middleware to veryfy a token
apiRoutes.use(function(req, res, next) {
	
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['authorization'];

	// decode token
	if(token) {
		
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if(err) {
				return res.json({ success: false, message: i18n.__('TOKEN_FAILED')});
			} else {
				// if everything is good, save to request for use in other routes
				req.decode = decoded;
				next();
			}
		});
	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: i18n.__('TOKEN_MISSING')
		});
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
			message: i18n.__('CUSTOMER_NAME_ALREADY_IN_USE') });
		} else {
			var newCustomer = new Customer({
				name: req.body.name
			});

			newCustomer.save(function(error) {
				if(error) return error;

				res.json({ success: "Success", message: i18n.__('CUSTOMER_CREATED') });
			})
		}
	});
});

// Delete spesific customer
apiRoutes.delete('./customer/:id/delete', function(req, res, next) {
	Project.findOne({ customerId: req.params.id }, function(error, project) {
		if(project) {
			res.json({ success: "Failure",
			message: i18n.__('CAN_NOT_DELETE_CUSTOMER') });
		} else {
			Customer.findByIdAndRemove(req.params.id, function(err) {
				if(err) return next(err);

				res.json({ success: "Success", message: i18n.__('CUSTOMER_DELETED') });
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
			message: i18n.__('STATUS_ALREADY_IN_USE') });
		} else {
			var newStatus = new Status({
				name: req.body.name
			});
			newStatus.save(function(err) {
				if(err) return next(err);

				res.json({ success: "Success", message: i18n.__('STATUS_CREATED') });
			});
		}
	});
});

apiRoutes.delete('/statuses/:id', function(req, res, next) {
	Project.findOne({statusId: req.params.id}, function(error, project) {
		if(error) return next(err);

		if(project) {

			res.json({ success: false, message: i18n.__('CAN_NOT_DELETE_STATUS')})
		} else {
			Status.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: i18n.__('STATUS_DELETED') });
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
			res.json({ success: false, message: i18n.__('TYPE_NAME_ALREADY_IN_USE') });
		} else {
			var newType = new Type({
				name: req.body.name
			});

			newType.save(function(err) {
				if(err) return next(err);

				res.json({ success: true, message: i18n.__('TYPE_CREATED') })

			});
		}
	})
})

// Delete type
apiRoutes.delete('/types/:id', function(req, res, next) {
	Project.findOne({ typeId: req.params.id }, function(error, project) {
		if(project) {
			res.json({ success: false, message: i18n.__('CAN_NOT_DELETE_TYPE') });
		} else {
			Type.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: i18n.__('TYPE_DELETED') });
			})
		}
	})
})

// ROUTES FOR PROJECTS

// Get active projects
apiRoutes.get('/projects/active', function(req, res, next) {
	Status.find({}, function(err, statuses) {
		var projects = [];
		if(statuses) {
			statuses.map(function(status) {
				if(status.name == 'Pending') {

					Project.find({statusId: status._id})
						.populate('statusId')
						.populate('customerId')
						.populate('typeId')
						.exec(function(error, results) {
							if(error) {return next(error);}

							res.json(results);
					});
				}
			});
		}
	})
});

// Get all projects
apiRoutes.get('/projects', function(req, res, next) {
	Project.find({})
		 .populate('statusId')
		 .populate('customerId')
		 .populate('typeId')
		 .exec(function(error, results) {
		 	if(error) return next(error);

		res.json(results);
		 });
});

// Update spesific project
apiRoutes.put('/projects/:id', function(req, res, next) {

	Project.findOne({ _id: req.params.id }, (error, oldProject) => {

		Project.update({ _id: req.params.id }, {
			$set: { 
				name: req.body.name, 
				statusId: req.body.statusId,
				customerId: req.body.customerId,
				statusId: req.body.statusId,
				modifiedAt: Date.now() }},
			function(error, result) {
				if(error) return next(error);

				res.json(result);
			}
		)
	})
});

// Deleter spesific project
apiRoutes.delete('/project/:id', function(req, res, next) {
	Task.findOne({ projectId: req.params.id }, function(error, task) {
		if(error) return next(error);

		if(task) {
			res.json({ success: false, message: i18n.__('CAN_NOT_DELETE_PROJECT') });
		} else {

			Project.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: i18n.__('PROJECT_DELETED') });
			})	
		}
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

	if(req.body.customerId !== '' && req.body.name !== '' && req.body.number !== '' && req.body.statusId !== '') {
		
		Customer.findOne({_id: req.body.customerId}, function(error, customer) {
			if(error) return next(error);

			if(customer) {
				var projectName = req.body.number + '-' + customer.name + '-' + req.body.name;

				Project.findOne({ name: projectName }, function(err, project) {
					if(err) return next(err);

					if(project) {
						res.json({ success: "Failure", message: i18n.__('PROJECT_NAME_ALREADY_IN_USE') });
					} else {
						var newProject = new Project({
							name: projectName,
							statusId: req.body.statusId
						});

						newProject.save(function(err) {
							if(err) return next(err);

							res.json({ success: "Success", message: i18n.__('PROJECT_CREATED') });
						});
					}
				});
		} else {
			res.json({ success: "Failure", message: i18n.__('INVALID_CUSTOMER') });
		}
	});


	} else {
		res.json({ success: "Failure", message: i18n.__('FILL_ALL_FIELDS') });
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

apiRoutes.put('/user/:id', function(req, res, next) {
	
	if(req.decode._doc.admin == true) {
		var userId = req.params.id;
		User.findOne({_id: userId}, function(err, user) {
			if(err) return next(err);

			if(user) {
				// UPDATE USER INFO HERE!
				var pwd = req.body.password;
				if(pwd != undefined) {
					user.password = password.hashPwd(pwd);
				}
				
				if(req.body.admin != undefined) {
					user.admin = req.body.admin;
				} else {
					user.admin = false;
				}

				if(req.body.pm != undefined) {
					user.projectManager = req.body.pm;
				} else {
					user.projectManager = false;
				}
				user.save(function(result) {
					res.json(result);
				})

			} else {
				res.json({success: false, message: "User not found!"});
			}
		})
	} else {
		res.json({success: false, message: "Only admin can edit userinfo!"});
	}
	
})

apiRoutes.delete('/users/:id', function(req, res, next) {

	Task.findOne( {userId: req.params.id}, function(error, task) {
		if(error) return next(error);

		if(task) {
			res.json({ success: "Failure", message: i18n.__('CAN_NOT_DELETE_USER') });
		} else {

			User.findByIdAndRemove(req.params.id, function(err, result) {
			if(err) return next(err);
				res.json({ success: "Success", message: i18n.__('USER_DELETED') });
			})
		}
	})

	
});

// ROUTES FOR TASKS

// 2nd version of editing task
apiRoutes.put('/task/:id/edit', function(req, res, next) {

	var update = {};
	console.log(req.body.values.endedAt);
	if(req.body.values.endedAt !== null) {
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
									foundTask.createdAt = Date.parse(req.body.values.createdAt);
									foundTask.endedAt = Date.parse(req.body.values.endedAt);

									var elapsetTime = foundTask.endedAt - foundTask.createdAt;
									foundTask.hours = (((elapsetTime / 1000) / 60) / 60);

									foundTask.save(function(result) {
										res.json({ success: true, message: i18n.__('TASK_EDIT_SUCCESSFUL') });
									})

								} else {
									res.json({ success: false, message: i18n.__('INVALID_TASKTYPE') });
								}
							})
						} else {
							res.json({ success: false, message: i18n.__('INVALID_USER') });
						}
					})
				} else {
					res.json({ success: false, message: i18n.__('INVALID_PROJECT_NUMBER') });
				}
			})		
		});
	} else {
		res.json({ success: false, message: i18n.__('TASK_NOT_ENDED') });
	}

	
})

// Update spesific task
apiRoutes.put('/task/:id', function(req, res, next) {

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

		foundTask.save(function(result) {
			res.json(result);
		})
	});	

	
});


// Add new task
apiRoutes.post('/tasks', function(req, res, next) {
	var current = {};

	current.taskTypeId = req.body.taskTypeId;
	current.projectId = req.body.projectId;
	current.userId = req.body.userId;
	current.bigVisit = req.body.bigVisit;
	current.dirtyWork = req.body.dirtyWork;
	current.machineTime = req.body.machineTime;
	current.overtime = req.body.overtime;
	current.taskTypeId = req.body.taskTypeId;

	if(current.taskTypeId !== '') {
		
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

									res.json({ success: true, message: i18n.__('TASK_STARTED_AND_LAST_ONE_ENTED') });
							});
						};
					});

				} else {
					newTask.save(function(err) {
						if(err) return next(err);

						res.json({ success: true, message: i18n.__('NEW_TASK_CREATED') })
					});
				}
		});
	} else {
		
		res.json({ success: false, message: i18n.__('TASKTYPE_REQUIRED') });
	}
			
	
});

// Delete spesific task
apiRoutes.delete('/task/:id', function(req, res, next) {
	Task.findByIdAndRemove(req.params.id, function(err, result) {
		if(err) return next(err);

		res.json({ success: true, message: i18n.__('TASK_DELETED') });
	})
});

// Get all tasks from every user.
apiRoutes.post('/tasks/all', function(req, res, next) {

	var criteria = {};

	console.log("TaskTypeId: ", req.body.taskTypeId)

	if(req.body.taskTypeId !== 0 && req.body.taskTypeId !== "0") {
		criteria.taskTypeId = req.body.taskTypeId;
	}

	if(req.body.filteredProjects.length > 0) {
		criteria.projectId = {'$nin': req.body.filteredProjects};
	}

	if(req.body.activeProjects === true) {

		if(req.body.noTime === false) {
		criteria.createdAt = {'$gte': req.body.startDate, '$lte': req.body.endDate};
		}

		if(req.body.userId !== "0" && req.body.userId !== 0) {
			criteria.userId = req.body.userId;
		}

		// This reporting methods only searches projects that are at Pending state.
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

					Type.populate(results, {
						path: 'projectId.typeId'
					});

					Customer.populate(results, {
						path: 'projectId.customerId'
					}, () => {
						res.json(results);
					})
				});

			})
		})

	} else {

		if(req.body.noTime === false) {
			criteria.createdAt = {'$gte': req.body.startDate, '$lte': req.body.endDate};
		}

		if(req.body.userId !== "0" && req.body.userId !== 0) {
			criteria.userId = req.body.userId;
		}

		if(req.body.projectId !== 0 && req.body.projectId !== "0" && req.body.activeProjects === false) {
			criteria.projectId = req.body.projectId;
		}

		if(req.body.noTime === true && req.body.userId === 0 && req.body.userId !== "0" && req.body.projectId !== 0 && req.body.projectId !== "0") {
			return next();
		}

		Task.find(criteria)
		.populate('userId')
		.populate('projectId')
		.populate('taskTypeId')
		.exec(function(error, results) {
			if(error) return next(error);

			Type.populate(results, {
				path: 'projectId.typeId'
			});

			Customer.populate(results, {
				path: 'projectId.customerId'
			}, () => {
				res.json(results);
			})
		});
	}
});

// Find last 5 tasks what belong to spesific user
apiRoutes.get('/tasks/user/:id/limit/:limit', function(req, res, next) {
	
	User.findOne({_id: req.params.id}, function(err, user) {
		if(err) return next(err);

		if(!user) {
			res.json({ success: false, message: i18n.__('USER_NOT_FOUND') })
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
		res.json({ success: "Failure", message: i18n.__('SET_DATA_RANGE') })
	}

	
});


// Find tasks what belong to spesific user
apiRoutes.get('/tasks/user/:id', function(req, res, next) {
	
	User.findOne({_id: req.params.id}, function(err, user) {
		if(err) return next(err);

		if(!user) {
			res.json({ success: false, message: i18n.__('USER_NOT_FOUND') })
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
			res.json({success: false, message: i18n.__('TASKTYPE_NAME_ALREADY_IN_USE') })
		} else {
			var newTaskType = new Tasktype({
				name: req.body.name
			});

			newTaskType.save(function(err) {
				if(err) return next(err);

				res.json({success: true, message: i18n.__('NEW_TASKTYPE_CREATED') });
			})
		}
	})
})

apiRoutes.delete('/tasktypes/:id/delete', function(req, res, next) {
	Task.findOne({taskTypeId: req.params.id}, function(err, task) {
		if(err) return next(err);

		if(task) {
			res.json({success: false, message: i18n.__('CAN_NOT_DELETE_TASKTYPE')});
		} else {
			Tasktype.findByIdAndRemove(req.params.id, function(error, result) {
				if(error) return next(error);

				res.json({ success: true, message: i18n.__('TASKTYPE_DELETED') });
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
			res.send({success: true, message: i18n.__('DOWNLOAD_REPORT_AT') });
		});
	});
});

app.use('/api', apiRoutes);

// Entrypoint for the app frontend
app.get('/', function(req, res) {
	res.render('index');
});

var projectRoutes = require('./routes/project')(apiRoutes);
var settingsRoutes = require('./routes/settings')(apiRoutes);
var userRoutes = require('./routes/user')(apiRoutes);
var taskRoutes = require('./routes/task')(apiRoutes);

module.exports = app;