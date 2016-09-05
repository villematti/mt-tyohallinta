const Project = require('../models/Project');

module.exports = (router) => {
	router.post('/create-new-project', (req, res, next) => {
		
		var projectData = {};

		projectData.name = req.body.name;
		projectData.number = req.body.number;
		projectData.year = req.body.year;
		projectData.version = req.body.version;
		projectData.typeId = req.body.typeId;
		projectData.statusId = req.body.statusId;
		projectData.customerId = req.body.customerId;

		Project.findOne({ 
			number: projectData.number,
			year: projectData.year,
			version: projectData.version,
			typeId: projectData.typeId,
		}, (err, project) => {
			if (err) {return next(err);}

			if (project) {
				res.json({ success: false, message: "Project name already in use." })
			} else {
				if (projectData.name === '') {
					res.json({success: false, message: "Project name is required!" })
				} else {
					console.log("Error: name is: ", projectData.name)
				}
			}
		})
	});
}