var mongoose = require("mongoose");
var tools = require("../common/tools");

// Schema
var UserSchema = new mongoose.Schema({
    "id": {type:String, required: true, index: true, unique: true},         // 用户ID
    "account": {type: String, required: true, index: true, unique: true},   // 用户账户（手机号）
    "password": {type: String, required: true},                             // 用户密码
    "datecreated": {type: Date, default: Date.now},                         // 注册时间
    "nickname": String,                                                     // 用户昵称
    "name": String,                                                         // 用户名称
    "namePinyin":{type:String, default: '#'},                               // 姓名汉语拼音
    "nameInitial":{type:String, default: '#'},                              // 姓名汉语拼音首字母
    "nameInitialType":{type:Number, default: 2},                            // 姓名汉语拼音首字母类型 1:字母(a-z-A-Z) 2:其他符号
    "type": {type: String, default:"1"},                                    // 用户类型 1：其他 2：种植大户 3：村级经销商 4：乡镇经销商 5：县级经销商 it"s configured in config file right now
    "typeVerified": [{type: String}],                                       // 认证类型
    "dateTypeVerified": {
        "dateFirstAgent": Date,                                             // 用户第一次被认证为经纪人时间
        "dateAgent": Date,                                                  // 用户被认证为经纪人时间
        "dateFirstRSC": Date,                                               // 用户第一次被认证为县级经销商时间
        "dateRSC": Date                                                     // 用户被认证为县级经销商时间
    },
    "sex": {type: Boolean, default:false},                                  // 性别 0：男 1：女
    "photo": String,                                                        // 用户头像
    "regmethod": Boolean,                                                   // 注册方式 0：手机 1：web
    "score": Number,                                                        // 用户积分
    "inviterId": String,                                                    // 邀请人id
    "inviter":{type:mongoose.Schema.ObjectId, ref:"user"},                  // 邀请人
    "dateinvited" : Date,                                                   //邀请时间
    "webLoginId" : String,                                                  // web login id
    "appLoginId" : String,                                                  // app login id
    "appLoginAgent" : String,                                               // app login Agent
    "registerAgent": String,                                                // 注册时的设备
    "isUserInfoFullFilled":{type: Boolean, default: false},                 // 是否完善用户信息并获取积分
    "address":{                                                             // 用户所在地
        province:{type:mongoose.Schema.ObjectId, ref:"province"},
        city:{type:mongoose.Schema.ObjectId, ref:"city"},
        county:{type:mongoose.Schema.ObjectId, ref:"county"},
        town:{type:mongoose.Schema.ObjectId, ref:"town"}
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
    },
    "RSCInfo":{                                                             // regional service centre info
        "name":String,                                                      // true name
        "IDNo":{type:String, validate:tools.regexIdentityNo},               // identity number
        "phone":String,                                                     // RSC phone
        "companyName":String,                                               // company name
        "companyAddress":{                                                  // RSC address
            province:{type:mongoose.Schema.ObjectId, ref:"province"},
            city:{type:mongoose.Schema.ObjectId, ref:"city"},
            county:{type:mongoose.Schema.ObjectId, ref:"county"},
            town:{type:mongoose.Schema.ObjectId, ref:"town"},
            details:String
        },
        "products":[{type:mongoose.Schema.ObjectId, ref:"product"}],        // products RSC served
        "rewardshopGifts":[{type:mongoose.Schema.ObjectId, ref:"rewardshopgift"}],  // rewardshopgift RSC served
        "supportEPOS":{type: Boolean},                                      // support EPOS, true: yes  false:no
        "EPOSNo":{type:String}                                              // RPOS No
    },
    "isTestAccount":{type:Boolean, default:false},                          // is test account
    "sign": {                                                               // user sign
        "date": Date,                                                       // last time user sign
        "consecutiveTimes": Number                                          // the consecutive times user sign
    }
});

var PotentialCustomerSchema = new mongoose.Schema({
    "user":{type:mongoose.Schema.ObjectId, ref:"user"},     // 用户 reference
    "name":{type:String, required:true},                    // 姓名
    "namePinyin":{type:String, default: '#'},               // 姓名汉语拼音
    "nameInitial":{type:String, default: '#'},              // 姓名汉语拼音首字母
    "nameInitialType":{type:Number, default: 2},            // 姓名汉语拼音首字母类型 1:字母(a-z-A-Z) 2:其他符号
    "phone":{type:String, required:true},                   // 手机号码
    "sex":{type:Boolean, default:false},                    // 性别 0：男 1：女
    "address":{                                             // 用户所在地
        province:{type:mongoose.Schema.ObjectId, ref:"province"},
        city:{type:mongoose.Schema.ObjectId, ref:"city"},
        county:{type:mongoose.Schema.ObjectId, ref:"county"},
        town:{type:mongoose.Schema.ObjectId, ref:"town"}
    },
    "buyIntentions":[{type:mongoose.Schema.ObjectId, ref:"intention_product"}],     // 购买意向商品
    "remarks":{type:String},                                // 备注
    "dateTimeAdded":{type:Date, default:Date.now},          // 添加时间
    "dateAdded":{type:String},                              // 添加日期(北京时间)
    "isRegistered":{type:Boolean, default:false},           // 是否注册
    "dateTimeRegistered":{type:Date},                       // 注册时间
    "isBinded":{type:Boolean, default:false},               // 是否绑定该经纪人
    "dateTimeBinded":{type:Date}                            // 绑定该经纪人时间
});

var IntentionProductSchema = new mongoose.Schema({
    brand:{type:String, require:true},                   // 品牌名称
    name:{type:String, required:true},                   // 商品名称
    productRef:{type:mongoose.Schema.ObjectId, ref:'product'},
    brandRef:{type:mongoose.Schema.ObjectId, ref:'brand'},
    count:{type:Number, default:0}                      // 意向购买人数
});

// Indexes
UserSchema.index({account:"text", nickname:"text", name:"text"});
UserSchema.index({type:1});
UserSchema.index({name:1});
UserSchema.index({inviter:1, nameInitialType:1, namePinyin:1, dateinvited:-1, datecreated:-1});
UserSchema.index({RSCInfo:1, 'RSCInfo.products':1, 'RSCInfo.supportEPOS':1, 'RSCInfo.EPOSNo':1});
UserSchema.index({typeVerified:1, type:1, inviter:1, 'dateTypeVerified.dateFirstAgent':-1, 'dateTypeVerified.dateFirstRSC':-1, datecreated:-1});

PotentialCustomerSchema.index({"phone":1, unique:true});
PotentialCustomerSchema.index({"user":1, "dateAdded":1, "nameInitialType":1, "namePinyin":1, "dateTimeAdded":-1});
PotentialCustomerSchema.index({"user":1, "isRegistered":1, "isBinded":1});
PotentialCustomerSchema.index({"dateTimeAdded":-1});
PotentialCustomerSchema.index({"nameInitialType":1, "namePinyin":1});
PotentialCustomerSchema.index({"dateTimeRegistered":-1});

IntentionProductSchema.index({"name":1, unique:true});

var UserLogSchema = new mongoose.Schema({id: String, account: String, ip: String, date: String, loginAgent: String});

var UserOrderNumberSchema = new mongoose.Schema({
    "userId": {type:String, required:true, index: true, unique: true},  // 用户ID
    "numberForInviter": {type:Number, default:1},                       // 用户上次被新农代表查看后的新增订单数
    "dateUpdated": {type: Date, default: Date.now},
    "dateCreated": {type: Date, default: Date.now}
});

// Model
mongoose.model("user", UserSchema);
mongoose.model("users-log", UserLogSchema);
mongoose.model("userordersnumber", UserOrderNumberSchema);
mongoose.model("intention_product", IntentionProductSchema);
var PotentialCustomerModel = mongoose.model("potential_customer", PotentialCustomerSchema);

// hooks
UserSchema.post('save', function(doc){
    PotentialCustomerModel.findOneAndUpdate({phone:doc.account}, {$set:{isRegistered:true, dateTimeRegistered:new Date()}}, function(err){
        if(err){
            console.error(err);
        }
    })
});

//mongoose.set("debug", true);
//
//userModel.on("index", function(err){
//    if(err){
//        console.error(err);
//    }else{
//        console.info()
//    }
//})