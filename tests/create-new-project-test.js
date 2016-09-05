var request = require('superagent');
var user1 = request.agent();
var server = require('./../index');

user1
  .post('/api/auth')
  .send({ user: 'villematti', password: 'azNHNdgN1980' })
  .end(function(err, res) {
  	console.log(res)
    // user1 will manage its own cookies
    // res.redirects contains an Array of redirects
  });

var data = {}

describe('loading express', () => {
	it('response to POST /create-new-project', (done) => {
		request(server)
			.post('/api/create-new-project', data)
			.expect({ success: true, message: "Project created!" })
			.end((err, res) => {
				if (err) throw err;
			})
	})
})