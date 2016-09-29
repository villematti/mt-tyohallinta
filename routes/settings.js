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
		Settings.findByIdAndRemove(req.params.id, (err, result) => {
				if(err) return next(err);

				res.json({ success: true, message: "Setting was deleted." });
			})
	})

	// Update settings function. Simplyfy the year changeing process
	router.put('/update-setting/:id', (req, res, next) => {
		Settings.findOne({_id: req.params.id}, (err, setting) => {
			if(err) {return next(err);}

			if(setting) {

				Settings.update({ _id: req.params.id}, {
					$set: {
						name: setting.name,
						value: req.body.value,
						modifiedAt: Date.now() 
					}}, (error, result) => {
						if(error) {return next(error);}

						res.json({ success: true, message: "Setting " + setting.name + " was updated to value " + req.body.value });
					}
				);

				
			} else {
				res.json({ success: false, message: "No setting found!" });
			}
		})
	})
}