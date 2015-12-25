var mongoose = require('mongoose');

// Schema
var userAddressSchema = new mongoose.Schema({
    'id': {type: String, index: true, unique: true},			// ID
    'userid': {type: String, required: true},					// 用户ID
    'address': {type: String, required: false},					// 地址信息
    'provincename': {type: String, required: false},			// 所属省Name
    'provinceid': {type: String, required: false},				// 所属省ID
    'cityname': {type: String, required: false},				// 所属市Name
    'cityid': {type: String, required: false},					// 所属市ID
    'countyname': {type: String, required: false},				// 所属县地区Name
    'countyid': {type: String, required: false},				// 所属省县地区ID
    'townname': {type: String, required: false},                // 所属乡镇Name
    'townid': {type: String, required: false},                  // 所属乡镇ID
    'receiptpeople': {type: String, required: false},			// 收货人
    'receiptphone': {type: String, required: false},			// 收货人手机号
    'zipcode': String,											// 邮政编码
    'type': Number,												// 1.默认 2.非默认 
    'datecreated': {type: Date, default: Date.now},			// 创建时间
    'dateupdated': {type: Date}                     		    // 更新时间
});

userAddressSchema.index({id: 1, userid: 1});
userAddressSchema.index({userid: 1, type: 1, provinceid: 1});
userAddressSchema.index({type: 1, dateupdated: -1, datecreated: -1});

// Model
mongoose.model('useraddress', userAddressSchema);
