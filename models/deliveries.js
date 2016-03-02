var mongoose = require('mongoose');

var deliverySchema = new mongoose.Schema({
	'name': String,
	'dateCreated': Date,
	'weight': Number
});

mongoose.model('delivery', deliverySchema);
