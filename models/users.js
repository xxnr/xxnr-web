var mongoose = require('mongoose');

// Schema
var UserSchema = new mongoose.Schema({
    'id': {type:String, required: true, index: true, unique: true},         // 用户ID
    'account': {type: String, required: true, index: true, unique: true},   // 用户账户（手机号）
    'password': {type: String, required: true},                             // 用户密码
    'datecreated': {type: Date, default: Date.now},                         // 注册时间
    'nickname': String,                                                     // 用户昵称
    'name': String,                                                         // 用户名称
    'type': {type: String, default:"1"},                                    // 用户类型 1：其他 2：种植大户 3：村级经销商 4：乡镇经销商 5：县级经销商 it's configured in config file right now
    'typeVerified': {type: String},                                         // 认证类型
    'sex': {type: Boolean, default:false},                                  // 性别 0：男 1：女
    'photo': String,                                                        // 用户头像
    'regmethod': Boolean,                                                   // 注册方式 0：手机 1：web
    'score': Number,                                                        // 用户积分
    'inviterId': String,                                                    // 邀请人id
    inviter:{type:mongoose.Schema.ObjectId, ref:'user'},                    // 邀请人
    'dateinvited' : Date,                                                   //邀请时间
    'webLoginId' : String,                                                  // web login id
    'appLoginId' : String,                                                  // app login id
    'registerAgent': String,                                                // 注册时的设备
    isUserInfoFullFilled:{type: Boolean, default: false},                   // 是否完善用户信息并获取积分
    address:{                                                               // 用户所在地
        province:{type:mongoose.Schema.ObjectId, ref:'province'},
        city:{type:mongoose.Schema.ObjectId, ref:'city'},
        county:{type:mongoose.Schema.ObjectId, ref:'county'},
        town:{type:mongoose.Schema.ObjectId, ref:'town'}
    },
    "v1.0-data":{
        "id":String,
        "login_name":String,
        "password":String,
        "no":String,
        "phone":String,
        "mobile":String,
        "user_type":String,
        "create_date":String,
        "update_date":String,
        "birth_date":String,
        "age":String
    }
});

// Indexes
UserSchema.index({account:"text", nickname:"text", name:"text"});

var UserLogSchema = new mongoose.Schema({id: String, account: String, ip: String, date: String, loginAgent: String});

var UserOrderNumberSchema = new mongoose.Schema({
    'userId': {type:String, required:true, index: true, unique: true},  // 用户ID
    'numberForInviter': {type:Number, default:1},                       // 用户上次被新农代表查看后的新增订单数
    'dateUpdated': {type: Date, default: Date.now},
    'dateCreated': {type: Date, default: Date.now}
});


// Model
mongoose.model('user', UserSchema);
mongoose.model('users-log', UserLogSchema);
mongoose.model('userordersnumber', UserOrderNumberSchema);

//mongoose.set('debug', true);
//
//userModel.on('index', function(err){
//    if(err){
//        console.error(err);
//    }else{
//        console.info()
//    }
//})