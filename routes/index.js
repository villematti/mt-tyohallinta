var express = require('express');


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
						token: token
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

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

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

apiRoutes.get('/users', function(req, res, next) {
	User.find({}, function(err, users) {
		if(err) return next(err);

		res.json(users);
	});
});

module.exports = apiRoutes;