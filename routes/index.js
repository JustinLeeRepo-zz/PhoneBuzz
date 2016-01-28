var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var twilio = require('twilio');

var client = new twilio.RestClient('Enter you accound SID', 'Enter your auth token');

var Product = require('../models/product')['Product'];

var fizzbuzz = function(number){
	var result = '';
	if(parseInt(number) < 1){
		result += 'Error. Enter a number greater than 0';
	}
	else{
		for(var i = 1; i <= parseInt(number); i++){
			if(i % 3 == 0 && i % 5 == 0){
				result += 'Fizz Buzz';
			}
			else if( i % 3 == 0 && i % 5 != 0){
				result += 'Fizz';
			}
			else if(i % 3 != 0 && i % 5 == 0){
				result += 'Buzz';
			}
			else{
				result += i;
			}
			result += ' ';
		}
	}
	
	return result;
};

router.use(bodyParser.urlencoded({
	extended: true
}));

router.get('/', function(req, res) {

	// The form's action is '/' and its method is 'POST',
	// so the `app.post('/', ...` route will receive the
	// result of our form
	var html = '<form action="/call" method="post">' +
				'Enter your phone number:' +
				'<div>' +
				'<input type="text" name="phoneNumber" placeholder="4151234568" maxLength="10" onkeypress="return event.charCode >= 48 && event.charCode <= 57"/>' +
				'</div>' +
				'<br>' +
				'Enter your delay:' +
				'<div>' +
				'<input type="text" name="hours" placeholder="hours" onkeypress="return event.charCode >= 48 && event.charCode <= 57">' +        
				'<input type="text" name="minutes" placeholder="minutes" onkeypress="return event.charCode >= 48 && event.charCode <= 57">' +
        		'<input type="text" name="seconds" placeholder="seconds" onkeypress="return event.charCode >= 48 && event.charCode <= 57">' +
        		'</div>' +
				'<button type="submit">Submit</button>' +	
				'</form>';
	Product.find(function(err, foundCall) {
		for (var i = foundCall.length - 1; i >= 0; i--) {
			html += '<form action="/replay" method="post">'+
			'<button name="button" value="'+foundCall[i]._id+'">'+
			'<div>' +
			'phone #: '+foundCall[i].to+'<br>'+
 			'delay: '+foundCall[i].delay+' seconds<br>'+
 			'time: '+foundCall[i].time+' seconds'+
			'</div>' +
			'</button>'+
			'</form>';
		};
		res.send(html);
	})
});

router.post('/', function(req, res) {
	var resp = new twilio.TwimlResponse();

	if (req.query.id === undefined){	
		resp.gather({action: '/buzz',finishOnKey: '#'}, function() {
			this.say('Enter a number followed by the pound symbol.');
		});
		res.writeHead(200, {
			'Content-Type':'text/xml'
		});
		res.end(resp.toString());
	}
	else{

		resp.gather({action: '/buzz?id=' + req.query.id,finishOnKey: '#'}, function() {
			this.say('Enter a number followed by the pound symbol.');
		});

		res.writeHead(200, {
			'Content-Type':'text/xml'
		});
		res.end(resp.toString());
	}
}) 

router.post('/buzz', function(req, res) {
	// var options = { url: 'http://451d95b1.ngrok.io/buzz?id=' };
	// var header = req.headers['x-twilio-signature'];
	// if(twilio.validateRequest('enter your auth token', header, 'http://451d95b1.ngrok.io/buzz', POST)) {
	// if (twilio.validateExpressRequest(req, 'enter your auth token')) {
		var callID = req.query.id;

		var respon = new twilio.TwimlResponse();
		
		Product.findOne({_id: callID}, function(err, foundCall){
			//twilio calls user(replay or input number)
			if(foundCall){
				if(req.body.Digits){
					foundCall.number = req.body.Digits;
					foundCall.save();
					respon.say(fizzbuzz(req.body.Digits));

					res.writeHead(200, {
						'Content-Type':'text/xml'
					});
					res.end(respon.toString());
				}
				else {

					var d = new Date();//.toISOString().replace(/T/, ' ').replace(/\..+/, '');
					var parsedDate = new Date(Date.parse(d))
					var newDate = new Date(parsedDate.getTime()).toISOString().replace(/T/, ' ').replace(/\..+/, '');

					var newProduct = new Product({to:foundCall.to, from:foundCall.from,time: newDate});
					newProduct.save();
					respon.say(fizzbuzz(foundCall.number));
					res.writeHead(200, {
						'Content-Type':'text/xml'
					});
					res.end(respon.toString());
				}
			}
			//user calls twilio num
			else{
				respon.say(fizzbuzz(req.body.Digits));
				res.writeHead(200, {
					'Content-Type':'text/xml'
				});
				res.end(respon.toString());
			}
			
		})
	// }
	// else {
	// 	console.log("not twilio. buzz off %j", req.query);
	// }
}) 

router.post('/call', function(req, res) {
	var delay = (Number((req.body.hours * 3600)) + Number((req.body.minutes * 60)) + Number(req.body.seconds)) * 1000;

	var d = new Date();//.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	
	var parsedDate = new Date(Date.parse(d))
	var newDate = new Date(parsedDate.getTime() + delay).toISOString().replace(/T/, ' ').replace(/\..+/, '');
	
	var newProduct = new Product({delay: delay, to:req.body.phoneNumber, from:'4152149285',time: newDate});
	
	newProduct.save();
	setTimeout(function(){
		client.calls.create({
		to:'+1' + req.body.phoneNumber,
		from:'+14152149285',
		url:'http://451d95b1.ngrok.io/?id=' + newProduct._id
		}, function(error, message) {
			if(!error) {
				console.log('Success! The SID for this call is:');
		        console.log(message.sid);
		 
		        console.log('Call sent to:');
		        console.log(message.to_formatted);
			}
			else {
				console.log('Oops! There was an error.');
			}
		});
  	//your code to be executed after 1 seconds
	}, delay);
	
})

router.post('/replay', function(req, res) {

	Product.findOne({_id: req.body.button}, function(err, foundCall){
		if(foundCall){

			client.calls.create({
					to:'+1' + foundCall.to,
					from:'+14152149285',
					url:'http://451d95b1.ngrok.io/buzz?id=' + foundCall._id
				}, function(error, message) {
					if(!error) {
						console.log('Success! The SID for this call is:');
				        console.log(message.sid);
				 
				        console.log('Call sent to:');
				        console.log(message.to_formatted);
					}
					else {
						console.log('Oops! There was an error.');
					}
				});
		}
	})

})

module.exports = router;