var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
});

var productSchema = new mongoose.Schema({
		time: String,
		delay: String,
		number: String,
		to: String,
		from: String
})

var Product = mongoose.model('Product', productSchema);

module.exports = {"Product": Product};