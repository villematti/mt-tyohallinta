const Settings = require('../models/settings');

module.exports = (router) => {
	router.post('/create-new-setting', (req, res, next) => {
		
		var settingData = {};

		settingData.name = req.body.name;
		settingData.value = req.body.value;

		var newSetting = new Settings({
			name: settingData.name,
			value: settingData.value
		})

		newSetting.save((err, response) => {
			if (err) {throw err;}

			res.send(response);

		});

		
	});

	router.get('/get-all-settings', (req, res, next) => {
		Settings.find({}, (err, settings) => {
			res.send(settings);
		})
	})

	router.delete('/delete-setting/:id', (req, res, next) => {
		Settings.findByIdAndRemove(req.params.id, function(err, result) {
				if(err) return next(err);

				res.json({ success: true, message: "Setting was deleted." });
			})
	})
}