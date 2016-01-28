var express =  require('express');
var app = express();
var bodyParser = require('body-parser');

var twilio = require('twilio');
var http = require('http');

var routes = require('./routes/index');


app.use('/', require('./routes/index'));
app.listen(1337);