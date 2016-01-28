var express = require('express');
var router = express.Router();

var twilio = require('twilio');

var client = new twilio.RestClient('AC137631c9cf92beea46084d872cc02a95', '7270213fc9ad7983533cd5da4e9be177');



router.get('/welcome', function(req, res){
	res.send('working woot');

	client.calls.create({
		to:'+16286008474',
		from:'+14152149285',
		url:'http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient'
		// body:'lol hello there this is j'
	}, function(error, message) {
		if(!error) {
			console.log('Success! The SID for this SMS message is:');
	        console.log(message.sid);
	 
	        console.log('Message sent on:');
	        console.log(message.dateCreated);
		}
		else {
			console.log('Oops! There was an error.');
		}
	});
})

module.exports = router;