const Project = require('../models/Project');
const Settings = require('./../models/Settings');
const Task = require('./../models/Task');
const Type = require('./../models/Type');
const Customer = require('./../models/Customer');
const Status = require('./../models/Status');
var i18n = require('i18n');

module.exports = (router) => {
	router.get('/find-projects-from-last-12-months', (req, res, next) => {
		var d = new Date();
		d.setMonth(d.getMonth() - 12);

		console.log("12 months ago: ", d);

		Project.find({createdAt: {'$gte': d}})
			.populate('statusId')
			.populate('customerId')
			.populate('typeId')
			.exec(function(error, results) {
				if(error) {return next(error);}

				res.json(results);
			})

	})

	router.post('/create-new-project', (req, res, next) => {

		projectNumberString = '';

		if (req.body.type !== undefined && req.body.name !== '' && req.body.customerId !== undefined && req.body.statusId !== undefined) {

			Type.findOne({_id: req.body.type}, (typeError, selectedType) => {

				// Required project type defination
				switch(selectedType.name) {
					case 'T':
						projectNumberString = 'taskProjectNumber';
					break;
					case 'M':
						projectNumberString = 'modelProjectNumber';
					break;
					case 'RT':
						projectNumberString = 'raumaTaskProjectNumber';
					break;
					case 'RM':
						projectNumberString = 'raumaModelProjectNumber';
					break;
					case 'JM':
						projectNumberString = 'joensuuModelProjectNumber';
					break;
					case 'JT':
						projectNumberString = 'joensuuTastProjectNumber';
					default:
						projectNumberString = 'taskProjectNumber';
					break;
				}

				// Check if there is appropiate number for project
				Settings.findOne({ name: projectNumberString }, (error, numberObject) => {

					// Check if year setting is set.
					Settings.findOne( {name: 'year'}, (error, yearObject) => {

						// If year object is not found, return error
						if (!yearObject) {
							return next();
						}

						var projectNumberObject;
						var projectData = {};

						if (numberObject) {
							projectNumberObject = numberObject;
						} else {
							projectNumber = 0;

							var newProjectNumber = new Settings({
								name: projectNumberString,
								value: 0
							})

							newProjectNumber.save();
							projectNumberObject = newProjectNumber;
						}

						projectData.name = req.body.name;
						projectData.number = projectNumberObject.value;
						projectData.year = yearObject.value;
						projectData.version = req.body.version;
						projectData.typeId = req.body.type;
						projectData.statusId = req.body.statusId;
						projectData.customerId = req.body.customerId;

						Project.findOne( {number: projectData.number, year: projectData.year, typeId: projectData.typeId}, (projectError, project) => {
							if(projectError) {return next(projectError);}

							if(project) {

								res.json({ success: false, message: "Invalid project number." })

							} else {

								Type.findOne({ _id: projectData.typeId }, (typeErr, type) => {

									Customer.findOne({ _id: projectData.customerId }, (customerErr, customer) => {
										projectData.displayName = '';

										projectData.displayName += type.name + projectData.number + projectData.year;

										if (projectData.version !== '' && projectData.version !== '00') {
											projectData.displayName += '-' + projectData.version
										}

										projectData.displayName += '-' + customer.name + '-' + projectData.name;

										createNewProject(projectData, projectNumberObject, res);
									})
								})
							}

						})


					})
				})
			})

		} else {
			res.json({success: false, message: "Fill all fields!"});
		}
	});


	// Update spesific project with id
	router.put('/update-project-with-id/:id', function(req, res, next) {

		Project.findOne({ _id: req.params.id }, (oldProjectError, oldProject) => {
			Type.findOne({ _id: req.body.typeId }, (typeError, newType) => {
				Customer.findOne({ _id: req.body.customerId }, (customerError, newCustomer) => {

					var displayName = '';

					displayName += newType.name + oldProject.number + oldProject.year;
					if (oldProject.version !== '' && oldProject.version !== '00' && oldProject.version !== undefined) {
						
						displayName += '-' + oldProject.version;
					}

					displayName += '-' + newCustomer.name + '-' + req.body.name;

					Project.update({ _id: req.params.id }, {
						$set: { 
							name: req.body.name, 
							statusId: req.body.statusId,
							customerId: req.body.customerId,
							typeId: req.body.typeId,
							displayName: displayName,
							modifiedAt: Date.now() }},
						function(error, result) {
							if(error) return next(error);

							res.json(result);
						}
					)
				})
			})

			
		})
	});

	router.post('/create-new-project-version', (req, res, next) => {
		Project.findOne({ _id: req.body.parentProjectId }, (oldProjectError, parentProject) => {
			Type.findOne({ _id: parentProject.typeId }, (typeError, newType) => {
				Customer.findOne({ _id: parentProject.customerId }, (customerError, newCustomer) => {

					var displayName = '';
					displayName += newType.name + parentProject.number + parentProject.year;
					displayName += '-' + req.body.version;
					displayName += '-' + newCustomer.name + '-' + req.body.name;
					console.log("New displayName: ", displayName);
					var newProjectVersion = new Project({
						name: req.body.name,
						version: req.body.version,
						number: parentProject.number,
						year: parentProject.year,
						statusId: parentProject.statusId,
						customerId: parentProject.customerId,
						typeId: parentProject.typeId,
						displayName: displayName
					})

					console.log(newProjectVersion);



					Project.find({ number: parentProject.number }, (error, projects) => {
						if (error) {return next(error)}

						if (projects) {
							var withCorrectYear = projects.map((project) => {
								if (project.year === parentProject.year) {
									return project;
								}
							})

							var withCorrectVersion = projects.map((project) => {
								if (project.version === req.body.version) {
									return project;
								}
							})

							console.log(withCorrectVersion.length)

							var x;
							var versionValidation = true;
							for (x = 0 ; x < withCorrectVersion.length ; x += 1) {
								if (withCorrectVersion[x] !== undefined) {
									versionValidation = false;
									console.log("If statement was called!");
								}
								console.log("Loop was called!");
							}

							if (versionValidation === false) {
								res.json({success: false, message: i18n.__('VERSIO_EXCISTS')})
							} else {
								newProjectVersion.save((creationError) => {
									if (creationError) {
										console.log(creationError.errors);
										res.json({success: false, message: i18n.__('CAN_NOT_NEW_VERSION_CREATED')})
									} else {
										res.json({success: true, message: i18n.__('NEW_VERSION_CREATED')})
									}
								})
							}
						}
					})
				})
			})
		})
	})

	router.get('/report-from-active-projects', (req, res, next) => {
		Status.findOne({name: 'Pending'}, (statusErr, status) => {
			if(statusErr) {return next(statusErr);}

			Project.find({statusId: status._id}, (projectErr, projects) => {
				var projectWorks = {};
				var projectIdArray = [];
				var projectIdBasedObject = {};

				projects.map((project) => {
					projectIdArray.push(project._id);
					projectIdBasedObject[project._id] = {
						displayName: project.displayName
					}
				})
					
				Task.find({projectId: { $in: projectIdArray }, hours: { $ne: null }}, (taskError, tasks) => {
					
					var projectReportObject = {};
					var projectsWithHours = [];

					projectIdArray.map((projectId) => {
						var hourCount = 0;
						var machineTimeCount = 0;

						tasks.map((task) => {

							if(String(task.projectId) === String(projectId)) {
								
								// Add project to project with hours
								projectsWithHours.push(projectId)

								machineTimeCount += task.machineTime;
								hourCount += task.hours;

								projectReportObject[projectId] = {
									machineTime: machineTimeCount,
									hours: hourCount,
									displayName: projectIdBasedObject[projectId].displayName
								}
							}
						});
					});

					// Add every project with 0 action to the list
					projectIdArray.map((idWithHours) => {
						if(projectsWithHours.indexOf(idWithHours) === -1) {
							projectReportObject[idWithHours] = {
								machineTime: 0,
								hours: 0,
								displayName: projectIdBasedObject[idWithHours].displayName
							}
						}
					})

					res.json(projectReportObject);
				})
			})
		})
	});
}

function createNewProject(projectData, numberObject, res) {
	var newProject = new Project(projectData);

	newProject.save((error) => {
		if (error) {
			console.log(error);
			res.json({success: false, message: error.message});
		} else {

			Settings.update({ _id: numberObject._id }, {
				$set: { value: Number(numberObject.value) + 1, modifiedAt: Date.now() }},
				function(error, result) {
					if(error) {res.json({success: false, message: error.message});
					} else {
						res.json({success: true, message: "Project created successfully."});
					}
				}
			)
			
		}
	})
}