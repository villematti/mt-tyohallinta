var crypto = require('crypto');
var config = require('../config.js');

var password = { encrypt: function(text) {
	var cipher = crypto.createCipher('aes-256-ctr', config.secret);
	var crypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return crypted;
}, decrypt: function(text) {
	var decipher = crypto.createDecipher('aes-256-ctr', config.secret);
	var dec = Buffer.concat([decipher.update(text), decipher.final()]);
	return dec;
}, hashPwd: function(text) {
	var hash = crypto.createHmac('sha256', config.secret)
        .update(text)
        .digest('hex');
    return hash
}};

module.exports = password;