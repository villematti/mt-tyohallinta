var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors');
var bodyparser = require('body-parser');
var app = express();

var port = 3000;

app.set('view engine', 'ejs');

app.use('/assets', express.static(__dirname + '/public'));
app.use(cors());


// Entrypoint for the app frontend
app.get('/', function(req, res) {
	res.render('index');
});