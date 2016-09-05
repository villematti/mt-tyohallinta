const Project = require('../models/Project')

module.exports = (router) => {
	router.post('/projects', (req, res, next) => {
		if (req.body.name === '') {
			res.send("No name given.")
		}
	})
}