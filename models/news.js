var mongoose = require('mongoose');

var newsCategorySchema = new mongoose.Schema({
    'id': String,
    'name': {type: String, required: true},
    'datecreated': {type:Date, default: Date.now},
    'dateupdated': Date,
    'status':  {type:
		[{
			'type': {type:String, required: true}, // type: '1':pre online, '2':online, '3':offline
			'count': {type:Number, required: true},
		}], required: true},		
	'count': {type:Number, required: true},
});

var newsSchema = new mongoose.Schema({
    'id': {type:String, required:true, index: true, unique: true},
    'picture': String,
    'category': {type: String, required: true},
    'title': {type: String, required: true},
    'datecreated': {type:Date, default: Date.now},
    'istop': {type:Boolean, default: false},
    'status': {type:String, default: 1}, 				// '1':pre online, '2':online, '3':offline
    'newsbody': String,
    'abstract': String
});

mongoose.model('newscategory', newsCategorySchema);
mongoose.model('news', newsSchema);