var mongoose = require('mongoose');

// Schema
var provinceSchema = new mongoose.Schema({
	'id': {type: String, index: true, unique: true},	// 省ID
	'tid': {type: String, required: true},				// 省taobaoID
	'name': {type: String, required: true},				// 省Name
	'uppername': {type: String, required: true},		// 省Upper Name
	'shortname': {type: String, required: true},		// 省Name
});
provinceSchema.index({shortname: 1});

var citySchema = new mongoose.Schema({
	'id': {type: String, index: true, unique: true},	// 市ID
	'tid': {type: String, required: true},				// 市taobaoID
	'name': {type: String, required: true},				// 市Name
	'uppername': {type: String, required: true},		// 市Upper Name
	'provinceid': {type: String, required: true},		// 所属省ID
});
citySchema.index({provinceid: 1});

var countySchema = new mongoose.Schema({
	'id': {type: String, index: true, unique: true},	// 县ID
	'tid': {type: String, required: true},				// 县taobaoID
	'name': {type: String, required: true},				// 县Name
	'uppername': {type: String, required: true},		// 县Upper Name
	'cityid': {type: String, required: true},			// 所属市ID
	'provinceid': {type: String, required: true},		// 所属省ID
});
citySchema.index({cityid:1, provinceid: 1});

var specialProvinceSchema = new mongoose.Schema({
	'id': String,										// 省ID
	'name': {type: String, required: true},				// 省Name
});

var townSchema = new mongoose.Schema({
	'id': {type: String, index: true, unique: true},	// 乡镇ID
	'tid': {type: String, required: true},				// 乡镇taobaoID
	'name': {type: String, required: true},				// 乡镇Name
	'chinesepinyin': {type: String, required: true},    // 乡镇拼音 Name
	'countyid': {type: String},							// 所属县ID
	'cityid': {type: String, required: true},			// 所属市ID
	'provinceid': {type: String, required: true},		// 所属省ID
});
townSchema.index({countyid:1, cityid:1, provinceid: 1});
townSchema.index({cityid:1, provinceid: 1});

// Model
mongoose.model('province', provinceSchema);
mongoose.model('city', citySchema);
mongoose.model('county', countySchema);
mongoose.model('town', townSchema);
// specialprovince
mongoose.model('specialprovince', specialProvinceSchema);
