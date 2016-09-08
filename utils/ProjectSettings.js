const Settings = require('./../models/Settings');

module.exports = {
	getCurrentProjectNumber: () => {
		var projectNumber;

		Settings.findOne({name: 'projectNumber'}, (error, result) => {
			if (error) {throw error;}

			if (result) {

				console.log(result)

				return result.value;
			} else {
				console.log("We are here!")
				projectNumber = 0;

				var newProjectNumberValue = new Settings({
					name: 'projectNumber',
					value: 0
				});

				newProjectNumberValue.save();
			}
		})

		return projectNumber;
	}
}