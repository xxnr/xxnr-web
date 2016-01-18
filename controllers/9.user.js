var tools = require('../common/tools');
var NodeRSA = require('node-rsa');
var fs = require('fs');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment-timezone');
var services = require('../services');
var UserSignService = require('../models/user_sign');
var UserService = services.user;
var UseraddressService = services.useraddress;
var AreaService = services.area;
var CartService = services.cart;
var OrderService = services.order;
var REG_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|IOS/i;

exports.install = function() {
	// LOGIN
	F.route('/api/v2.0/user/login/', 				    process_login, ['get', 'post']);
	//F.route('/logout/', 						        process_logout);

	// REGISTER
	F.route('/api/v2.0/user/register/', 				process_register, ['get', 'post']);

	// USER
	F.route('/api/v2.0/user/get/',					    json_user_get, ['get', 'post'], ['isLoggedIn']);
	F.route('/api/v2.0/user/resetpwd/',				    process_resetpwd, ['get', 'post']);
	F.route('/api/v2.0/user/modifypwd/',				json_user_modifypwd, ['get','post'], ['isLoggedIn']);
	F.route('/api/v2.0/user/modify/',				    json_user_modify, ['get', 'post'], ['isLoggedIn']);
	F.route('/api/v2.0/point/findPointList/',		    json_userscore_get, ['get', 'post'], ['isLoggedIn']);
    F.route('/api/v2.0/user/findAccount/',              json_user_findaccount, ['get', 'post']);
    F.route('/api/v2.0/user/bindInviter',               process_bind_inviter, ['get','post'], ['isLoggedIn']);
    F.route('/api/v2.0/user/getInvitee',                json_get_invitee, ['get', 'post'], ['isLoggedIn']);
    F.route('/api/v2.0/user/getInviteeOrders',          json_get_invitee_orders, ['get', 'post'], ['isLoggedIn']);
	F.route('/api/v2.0/usertypes',                      json_usertypes_get, ['get']);

	// User Address
	F.route('/api/v2.0/user/getUserAddressList/',	    json_useraddresslist_query, ['get', 'post'],['isLoggedIn']);
	F.route('/api/v2.0/user/saveUserAddress/',		    json_useraddress_create, ['get', 'post'],['isLoggedIn']);
	F.route('/api/v2.0/user/updateUserAddress/',		json_useraddress_update, ['get', 'post'],['isLoggedIn']);
	F.route('/api/v2.0/user/deleteUserAddress/',		json_useraddress_remove, ['get', 'post'],['isLoggedIn']);

    // RSA public key
    F.route('/api/v2.0/user/getpubkey/',                json_public_key, ['get', 'post']);

    // Use sign
    F.route('/api/v2.0/user/sign/',                     process_user_sign, ['get','post'], ['isLoggedIn']);

    // upload user photo for app
    F.route('/api/v2.0/user/uploadPortrait',            uploadPhoto, ['post', 'upload'], 1024*20, ['isLoggedIn']);
    // upload user photo for web
    F.route('/api/v2.0/user/upload',                    userUpload, ['post', 'upload'], 1024*20, ['isLoggedIn']);
    // confirm user photo for web
    F.route('/api/v2.0/user/confirmUpload',             confirmUpload, ['get', 'post'], ['isLoggedIn']);

    F.route('/api/v2.0/user/isAlive',                   isAlive, ['get'], ['isLoggedIn']);

    // check user in white list
    F.route('/api/v2.0/user/isInWhiteList',             isInWhiteList, ['get', 'post'], ['isLoggedIn', 'isInWhiteList']);

	// v1.0
	// LOGIN
	//fix api// F.route('/app/user/login/', 				        process_login, ['get', 'post']);
	//F.route('/logout/', 						                    process_logout);

	// REGISTER
	//fix api// F.route('/app/user/register/', 				        process_register, ['get', 'post']);

	// USER
	//fix api// F.route('/app/user/get/',					        json_user_get, ['get','post'], ['isLoggedIn']);
	//fix api// F.route('/app/user/resetpwd/',				        process_resetpwd, ['get', 'post']);
	//fix api// F.route('/app/user/modifypwd/',				        json_user_modifypwd , ['get','post'], ['isLoggedIn']);
	//fix api// F.route('/app/user/modify/',				        json_user_modify, ['post'], ['isLoggedIn']);
	//fix api// F.route('/app/point/findPointList/',		        json_userscore_get, ['get', 'post'], ['isLoggedIn']);

	// User Address
	//fix api// F.route('/app/user/getUserAddressList/',	        json_useraddressslist_query_lagency, ['get', 'post'], ['isLoggedIn']);
	//fix api// F.route('/app/user/saveUserAddress/',		        json_useraddress_create, ['get', 'post'], ['isLoggedIn']);
	//fix api// F.route('/app/user/updateUserAddress/',		        json_useraddress_update, ['get', 'post'], ['isLoggedIn']);
	//fix api// F.route('/app/user/deleteUserAddress/',		        json_useraddress_remove, ['get', 'post'], ['isLoggedIn']);

    // RSA public key
    //fix api// F.route('/app/user/getpubkey/',                     json_public_key, ['get', 'post']);

    //fix api// F.route('/app/user/uploadHeadPortrait',             uploadPhoto, ['post', 'upload'], 1024*20, ['isLoggedIn']);
};
if(!F.global.key){
    var key = null;
    if(F.isDebug){
        // in debug mode we use key in memory
        key = new NodeRSA({b:512});
        key.generateKeyPair();
    }else {
        // we read private key in file instead of generating key each time in memory
        // because in product environment we use pm2 to host 4 processes, and each process will generate
        // a different key. Thus, if one request is accessing process 1 to get public key and accessing process 2
        // to send encrypted data, the decryption will fail.
        // known issue: we cannot start node in release mode in other environment except prod
        // unless we have a private_key.pem file in root folder.
        var private_key_string = fs.readFileSync('private_key.pem');
        key = new NodeRSA(private_key_string);
    }

    F.global.key = key;
}

F.global.usertypes = JSON.parse(F.config.user_types);

// ==========================================================================
// LOGIN
// ==========================================================================

var files = DB('files', null, require('total.js/database/database').BUILT_IN_DB).binary;

// Login
function process_login() {
    var self = this;
    var options = {};
    if (!self.data.account){
        self.respond({code:1001,message:'请输入账号'});
        return;
    }

    if (!self.data.password){
        self.respond({code:1001,message:'请输入密码'});
        return;
    }

    options.account = self.data.account;
    if (self.data.password) {
        options.password = tools.decrypt_password(decodeURI(self.data.password));
    }

    var keepLogin = !(self.data.keepLogin === 'false');
    options.useragent = self.data["user-agent"] || 'web';
    options.ip = self.req.ip;

    UserService.login(options, function (err, data) {
        // Error
        if (err) {
            console.error('user process_login fail:', err);
            self.respond({code:1001, message:err});
            return;
        }

        var user = {};
        user.userid = data.id;
        user.nickname = data.nickname;
        user.loginName = data.account;
        user.name = data.name;
        user.phone = data.phone || data.account;
        user.sex = data.sex;
        user.photo = data.photo;
        user.userType = data.type;
		user.userAddress = data.address;
        user.isVerified = data.isVerified;
        user.isUserInfoFullFilled = data.isUserInfoFullFilled;

        CartService.getOrAdd(user.userid, function(err, cart){
            if(err){
                self.respond({code:1001, message:'获取购物车id失败'});
                return;
            }

            user.cartId = cart.cartId;
            setCookieAndResponse.call(self, user, keepLogin);
        }, false);
    });
}

var setCookieAndResponse = function(user, keepLogin){
    var self = this;

    // Set cookie
    // self.res.cookie(F.config.usercookie, F.encrypt({ userid: user.userid, ip: self.req.ip }, 'user'), new Date().add('5 minutes'));
    var options = {userid:user.userid};
    var userAgent = self.data['user-agent'];
    if(REG_MOBILE.test(userAgent)){
        // is app
        options.appLoginId = U.GUID(10);
    }else{
        // is web
        options.webLoginId = U.GUID(10);
    }

    var token = tools.generate_token(user.userid, options.appLoginId, options.webLoginId);
    UserService.update(options, function(err){
        if(err){
            console.error('setCookieAndResponse err:', err);
            self.respond({code:1001, message:'登录失败'});
            return;
        }

        var cookieUserInfo = {userid: user.userid, loginName: user.loginName};
        if (user && user.nickname && user.nickname.length > 0) {
            cookieUserInfo.nickName = encodeURIComponent(user.nickname);
        }
        if(keepLogin){
            if(F.isDebug){ 
                self.res.cookie(F.config.usercookie, JSON.stringify(cookieUserInfo), new Date().add(F.config.usercookie_expires_in));
                self.res.cookie(F.config.tokencookie, token, new Date().add(F.config.token_cookie_expires_in));
            }else {
                self.res.cookie(F.config.usercookie, JSON.stringify(cookieUserInfo), new Date().add(F.config.usercookie_expires_in), {domain: F.config.domain});
                self.res.cookie(F.config.tokencookie, token, new Date().add(F.config.token_cookie_expires_in), {domain: F.config.domain});
            }
        }else{
            if(F.isDebug){
                self.res.cookie(F.config.usercookie, JSON.stringify(cookieUserInfo));
                self.res.cookie(F.config.tokencookie, token);
            }else {
                self.res.cookie(F.config.usercookie, JSON.stringify(cookieUserInfo), null, {domain: F.config.domain});
                self.res.cookie(F.config.tokencookie, token, null, {domain: F.config.domain});
            }
        }

        // Return results
        var result = {'code': '1000', 'message': 'success', 'datas': user, token:token};
        self.respond(result);
    });
};

// Logout
/*function process_logout() {
	var self = this;
	self.res.cookie(F.config.usercookie, '', new Date().add('-1 year'));
	self.redirect('/');
}*/

// ==========================================================================
// REGISTER
// ==========================================================================

// Register
function process_register() {
    var self = this;
    var options = {};
    var keepLogin = self.data.keepLogin || true; //是否保存登录状态，默认保存
    if (!self.data.account || !tools.isPhone(self.data.account.toString())) {
        self.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
        return;
    }
    if (!self.data.smsCode) {
        self.respond({'code': '1001', 'message': '请输入验证码'});
        return;
    }
    if (!self.data.password) {
        self.respond({'code': '1001', 'message': '请输入密码'});
        return;
    }

    var decrypted = tools.decrypt_password(decodeURI(self.data.password));
    if (decrypted.length < 6) {
        self.respond({'code': '1001', 'message': '密码长度需不小于6位'});
        return;
    }
    options.account = self.data.account;
    options.smsCode = self.data.smsCode;
    options.password = decrypted;
    if (self.data.regMethod)
        options.regMethod = self.data.regMethod;
    if (self.data.nickname)
        options.nickname = self.data.nickname;
    options.ip = self.req.ip;
    options.useragent = self.data["user-agent"] || 'web';

    var vcodeoptions = {'target': self.data.account.toString(), 'code_type': 'register', 'code': self.data.smsCode};
    GETSCHEMA('VCode').workflow('verify', null, vcodeoptions, function (err, result) {
        if (err || !result) {
            self.respond({'code': '1001', 'message': '验证码验证错误'});
            return;
        } else {
            if (result && result.type === 1) {
                UserService.create(options, function (err, data) {
                    // Error
                    if (err) {
                        self.respond({'code': '1001', 'message': err});
                        return;
                    } else {
                        // Return user data
                        var user = {};
                        user.userid = data.id;
                        user.nickname = data.nickname;
                        user.loginName = data.account;
                        user.phone = data.phone || data.account;
                        user.sex = data.sex;
                        user.potho = data.photo;
                        user.userType = data.type;
                        user.isVerified = false;
                        user.isUserInfoFullFilled = data.isUserInfoFullFilled;

                        setCookieAndResponse.call(self, user, keepLogin);
                    }
                }, true);
            } else {
                self.respond({'code': '1001', 'message': result.data});
                return;
            }
        }
    }, true);
}

// ==========================================================================
// USER
// ==========================================================================

// Reset password
function process_resetpwd() {
    var self = this;
    var options = {};

    if (!self.data.account || !tools.isPhone(self.data.account.toString())) {
        self.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
        return;
    }
    if (!self.data.smsCode) {
        self.respond({'code': '1001', 'message': '请输入验证码'});
        return;
    }
    if (!self.data.newPwd) {
        self.respond({'code': '1001', 'message': '请输入密码'});
    }
    var decrypted = tools.decrypt_password(decodeURI(self.data.newPwd));
    if (decrypted.length < 6) {
        self.respond({'code': '1001', 'message': '密码长度需不小于6位'});
        return;
    }
    options.account = self.data.account;
    options.smsCode = self.data.smsCode;
    options.password = decrypted;
    options.ip = self.req.ip;

    vcodeoptions = {'target': self.data.account.toString(), 'code_type': 'resetpwd', 'code': self.data.smsCode};
    GETSCHEMA('VCode').workflow('verify', null, vcodeoptions, function (err, result) {
        if (err || !result) {
            self.respond({'code': '1001', 'message': '验证码验证错误'});
            return;
        } else {
            if (result && result.type === 1) {
                UserService.update(options, function (err) {
                    // Error
                    if (err) {
                        self.respond({'code': '1001', 'message': '密码修改失败'});
                        return;
                    } else {
                        // Return results
                        self.respond({'code': '1000', 'message': 'success'});
                    }
                });
            } else {
                self.respond({'code': '1001', 'message': result.data});
                return;
            }
        }
    }, true);
}

// Get user
function json_user_get() {
    var self = this;
    self.data.id = self.data.userId = (self.data.id || self.data.userId);
    var options = {};

    if (self.data.id)
        options.userid = self.data.id;
    options.ip = self.req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            self.respond({'code': '1001', 'message': err});
            return;
        }

        // Return user data
        var user = {};
        user.userid = data.id;
        user.nickname = data.nickname;
        user.loginName = data.account;
        user.name = data.name;
        user.phone = data.phone || data.account;
        user.sex = data.sex;
        user.photo = data.photo;
        user.userType = data.type;
        user.pointLaterTrade = data.score || 0;
        user.dateinvited = data.dateinvited;
        user.address = data.address;
        user.isVerified = data.isVerified;
        user.isUserInfoFullFilled = data.isUserInfoFullFilled;
        if (data.inviter) {
            user.inviterId = data.inviter.id;
            user.inviter = data.inviter.account;
            user.inviterPhoto = data.inviter.photo;
            user.inviterNickname = data.inviter.nickname;
            user.inviterName = data.inviter.name;
        }

        var flags = self.data['flags'];
        var respond = function (user) {
            self.respond({'code': '1000', 'message': 'success', 'datas': user});
        };

        if (!flags) {
            // Return results
        }
        else {
            var responds = {};

            if (flags.indexOf('score') >= 0) {
                responds['score'] = (respond);
                respond = function (user) {
                    json_userscore_get.call(self, function (score) {
                        user.score = score;
                        // console.log('user = ' + JSON.stringify(user));
                        responds['score'](user);
                    });
                };
            }

            if (flags.indexOf('address') >= 0) {
                responds['address'] = respond;
                respond = function (user) {
                    json_useraddresslist_query.call(self, function (addresses) {
                        user.addresses = addresses;
                        user.defaultAddress = getDefaultAddress(addresses);
                        responds['address'](user);
                    });
                };
            }

            if (flags.indexOf('order') >= 0) {
                responds['order'] = respond;
                respond = function (user) {
                    require("./7.order").getOders.call(self, function (orders) {
                        user.orders = orders;
                        responds['order'](user);
                    });
                };
            }
        }

        respond(user);
    });
}

// Get user score
function json_userscore_get(callback) {
    var self = this;
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    options.ip = self.req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            self.respond({'code': '1001', 'message': err});
            return;
        }

        // Return data
        var score = data.score || 0;
        callback ? callback(score) : self.respond({'code': '1000', 'message': 'success', 'datas': {"total": 0, "userId": data.id, "pointLaterTrade": (score || 0), "score":(score || 0), "rows": []}});
    });
}

// Modify user password
function json_user_modifypwd() {
    var self = this;
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    if (!self.data.oldPwd) {
        self.respond({'code': '1001', 'message': '请输入旧密码'});
        return;
    }
    if (!self.data.newPwd) {
        self.respond({'code': '1001', 'message': '请输入新密码'});
    }
    var decryptedNewPwd = tools.decrypt_password(decodeURI(self.data.newPwd));
    var decryptedOldPwd = tools.decrypt_password(decodeURI(self.data.oldPwd));
    if (decryptedNewPwd.length < 6) {
        self.respond({'code': '1001', 'message': '新密码长度需不小于6位'});
        return;
    }
    if (decryptedNewPwd === decryptedOldPwd) {
        self.respond({'code': '1001', 'message': '新密码与旧密码不能一致'});
        return;
    }

    options.password = decryptedNewPwd;
    options.ip = self.req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            self.respond({'code': '1001', 'message': err});
            return;
        }

        var password_valid = false;
        try{
            password_valid = bcrypt.compareSync(decryptedOldPwd, data.password);
        } catch(e){
        }
        if(!password_valid) {
            // try to use md5 hash to keep compatible with v1.0 user
            // calculate md5 hash
            var hasher=crypto.createHash("md5");
            hasher.update(decryptedOldPwd + '_stormy');//'_stormy' is salt number for v1.0
            var hash_md5=hasher.digest('hex');
            if(hash_md5 == data.password){
                password_valid = true;
            }
        }

        if (password_valid) {
            UserService.update(options, function (err) {
                // Error
                if (err) {
                    self.respond({'code': '1001', 'message': '密码修改失败'});
                    return;
                } else {
                    // Return results
                    self.respond({'code': '1000', 'message': 'success'});
                    return;
                }
            });
        } else {
            self.respond({'code': '1001', 'message': '旧密码输入错误'});
            return;
        }
    });
}

// modify user info
function json_user_modify() {
    var self = this;
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    if (self.data.userName)
        options.name = self.data.userName;
    if (self.data.nickName) {
        //if(self.data.nickName.length > 6) {
        if (tools.getStringLen(self.data.nickName, 12)) {
            self.respond({'code': '1001', 'message': '昵称输入过长'});
            return;
        } else {
            options.nickname = self.data.nickName;
        }
    }
    if (self.data.userPhoto)
        options.photo = self.data.userPhoto;
    if (self.data.sex)
        options.sex = self.data.sex;
    options.ip = self.req.ip;
	if (self.data.type) {
        if(!F.global.usertypes[self.data.type]){
            self.respond({code:1001, message:'未查询到用户类型'});
            return;
        }

        options.type = self.data.type;
    }

    UserService.get({userid:self.data.userId}, function(err, old_user_info){
        var callback = function (err) {
            // Error
            if (err) {
                self.respond({'code': '1001', 'message': err});
                return;
            }

            // Return results
            if(!old_user_info.isUserInfoFullFilled){
                UserService.get({userid:self.data.userId}, function(err, new_user_info) {
                    if (new_user_info.name && new_user_info.address && new_user_info.address.province && new_user_info.type) {
                        UserService.update({userid:self.data.userId, isUserInfoFullFilled: true}, function (err, data) {
                            UserService.increaseScore({userid: self.data.userId, score: F.config.user_info_full_filled_point_add}, function (err) {
                                var response = {'code': '1000', 'message': 'success'};
                                if (!err) {
                                    response.scoreAdded = F.config.user_info_full_filled_point_add;
                                }

                                self.respond(response);
                            })
                        });
                    } else {
                        self.respond({'code': '1000', 'message': 'success'});
                    }
                })
            } else{
                self.respond({'code': '1000', 'message': 'success'});
            }
        };
        if (self.data.address && self.data.address.provinceId && self.data.address.cityId) {
            var address = self.data.address;
            options.address = {};
            AreaService.getProvince({id: address.provinceId}, function (err, province) {
                if (err) {
                    console.error('get province err:', err);
                    self.respond({code: 1001, message: err});
                    return;
                }

                options.address.province = province;
                AreaService.getCity({id: address.cityId}, function (err, city) {
                    if (err) {
                        console.error('get city err:', err);
                        self.respond({code: 1001, message: err});
                        return;
                    }

                    options.address.city = city;
                    if (self.data.address.countyId) {
                        AreaService.getCounty({id: address.countyId}, function (err, county) {
                            if (err) {
                                console.error('get county err:', err);
                                self.respond({code: 1001, message: err});
                                return;
                            }

                            options.address.county = county;
                            if (address.townId) {
                                AreaService.getTown({id: address.townId}, function (err, town) {
                                    if (err) {
                                        console.error('get town err:', err);
                                        self.respond({code: 1001, message: err});
                                        return;
                                    }

                                    options.address.town = town;
                                    UserService.update(options, callback);
                                })
                            } else {
                                UserService.update(options, callback);
                            }
                        })
                    } else if (address.townId) {
                        AreaService.getTown({id: address.townId}, function (err, town) {
                            if (err) {
                                console.error('get town err:', err);
                                self.respond({code: 1001, message: err});
                                return;
                            }

                            options.address.town = town;
                            UserService.update(options, callback);
                        })
                    } else {
                        UserService.update(options, callback);
                    }
                })
            })
        } else{
            UserService.update(options, callback);
        }
    })
}

// Find Account in users
function json_user_findaccount() {
    var self = this;
    var options = {};

    if (self.data.account)
        options.account = self.data.account;
    options.ip = self.req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            self.respond({'code': '1001', 'message': err});
            return;
        }

        self.respond({'code': '1000', 'message': 'success'});
    });
}

// ==========================================================================
// User Address
// ==========================================================================

// Query useraddress list
function json_useraddresslist_query(callback) {
    var self = this;
    var callbackName = self.data['callback'] || 'callback';
    var options = {};

    if (!self.data.userId) {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    options.userid = self.data.userId;
    options.ip = self.req.ip;

    UseraddressService.query(options, function (err, data) {
        // Error
        if (err) {
            console.error('user json_useraddresslist_query UseraddressService query err:', err);
            if (data) {
                self.respond(data);
                return;
            } else {
                self.respond({'code': '1001', 'message': '未查询到收货地址'});
                return;
            }
        } else {
            var items = data.items;
            var count = data.count;
            var arr = new Array(count);

            for (var i = 0; i < count; i++) {
                var item = items[i];
                arr[i] = {"areaName": item.provincename,
                    "areaId": item.provinceid,
                    "cityName": item.cityname,
                    "cityId": item.cityid,
                    "countyName": item.countyname,
                    "countyId": item.countyid,
                    "address": item.address,
                    "receiptPhone": item.receiptphone,
                    "receiptPeople": item.receiptpeople,
                    "userId": item.userid,
                    "type": item.type,
                    "addressId": item.id,
                    "zipCode": item.zipcode || '',
                    "townId": item.townid,
                    "townName": item.townname || null
                };
            }
            // Return results
            callback ? callback(arr) : self.respond({'code': '1000', 'message': 'success', 'datas': {"total": count, "rows": arr}});
        }
    });
}

// Query useraddress list (v1.0 app)
function json_useraddressslist_query_lagency(){
    var self = this;
    var options = {};

    if (!self.data.userId) {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    options.userid = self.data.userId;
    options.ip = self.req.ip;

    UseraddressService.query(options, function (err, data) {
        // Error
        if (err) {
            console.error('user json_useraddressslist_query_lagency UseraddressService query err:', err);
            if (data) {
                self.respond(data);
                return;
            } else {
                self.respond({'code': '1001', 'message': '未查询到收货地址'});
                return;
            }
        } else {
            var items = data.items;
            var count = data.count;
            var arr = new Array(count);

            for (var i = 0; i < count; i++) {
                var item = items[i];
                arr[i] = {"areaName": item.provincename,
                    "areaId": item.provinceid,
                    "cityName": item.cityname,
                    "cityId": item.cityid,
                    "countyName": item.countyname,
                    "countyId": item.countyid,
                    "address": item.cityname + (item.countyname || '') + item.address,
                    "receiptPhone": item.receiptphone,
                    "receiptPeople": item.receiptpeople,
                    "userId": item.userid,
                    "type": item.type,
                    "addressId": item.id,
                    "zipCode": item.zipcode || '',
                    "townId": item.townid,
                    "townName": item.townname
                };
            }
            // Return results
            self.respond({'code': '1000', 'message': 'success', 'datas': {"total": count, "rows": arr}});
        }
    });
}

// Create useraddress
function json_useraddress_create() {
    var self = this;
    var callbackName = self.data['callback'] || 'callback';
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    if (self.data.address)
        options.address = self.data.address;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的address参数'});
        return;
    }
    if (self.data.areaId)
        options.provinceid = self.data.areaId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的areaId参数'});
        return;
    }
    if (self.data.cityId)
        options.cityid = self.data.cityId;
    if (self.data.countyId)
        options.countyid = self.data.countyId;
    if (self.data.townId)
        options.townid = self.data.townId;
    if (self.data.receiptPhone) {
        if (!tools.isPhone(self.data.receiptPhone.toString())) {
            self.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
            return;
        }
        options.receiptphone = self.data.receiptPhone;
    }
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的receiptPhone参数'});
        return;
    }
    if (self.data.receiptPeople)
        options.receiptpeople = self.data.receiptPeople;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的receiptPeople参数'});
        return;
    }
    if (self.data.type && U.parseInt(self.data.type) === 1)
        options.type = 1;
    else
        options.type = 2;

    if (self.data.zipCode)
        options.zipcode = self.data.zipCode;


    UseraddressService.create(options, function (err, data) {
        // Error
        if (err) {
            console.error('user json_useraddress_create UseraddressService create err:', err);
            if (data) {
                self.respond(data);
                return;
            } else {
                self.respond({'code': '1001', 'message': '保存收货地址失败'});
                return;
            }
        } else {
            // Return results
            self.respond({'code': '1000', 'message': 'success'});
            if (U.parseInt(self.data.type) === 1) {
                var newaddId = data.id;
                var Qoptions = {'userid': self.data.userId, 'type': 1};

               UseraddressService.query(Qoptions, function (err, data) {
                    if (err) {
                        console.error('user json_useraddress_create UseraddressService query err:', err);
                        self.respond({'code': '1001', 'message': '保存收货地址失败'});
                        return;
                    }
                    var items = data.items;
                    var count = data.count;
                    for (var i = 0; i < count; i++) {
                        var item = items[i];
//                        var updateitem = {'userid': item.userid, 'type': 2, 'id': item.id};

                        data.items[i].type = 2;
                        if (newaddId !== item.id) {
                            UseraddressService.update(data.items[i], function (err, data) {
                                if (err) {
                                    var printerror = ['重置用户', item.userid.toString(), '默认收货地址出错'];
                                    console.error(printerror.join(''));
                                }
                            }, true);
                        }
                    }
                });
            }
        }
    }, true);
}

// Update useraddress
function json_useraddress_update() {
    var self = this;
    var callbackName = self.data['callback'] || 'callback';
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    if (self.data.addressId)
        options.id = self.data.addressId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的addressId参数'});
        return;
    }
    if (self.data.address)
        options.address = self.data.address;
    if (self.data.areaId)
        options.provinceid = self.data.areaId;
    if (self.data.cityId)
        options.cityid = self.data.cityId;
    if (self.data.countyId)
        options.countyid = self.data.countyId;
    if (self.data.townId)
        options.townid = self.data.townId;
    if (self.data.receiptPhone) {
        if (!tools.isPhone(self.data.receiptPhone.toString())) {
            self.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
            return;
        }
        options.receiptphone = self.data.receiptPhone;
    }
    if (self.data.receiptPeople)
        options.receiptpeople = self.data.receiptPeople;
    if (self.data.type) {
        if (U.parseInt(self.data.type) === 1)
            options.type = 1;
        else
            options.type = 2;
    }

    if (self.data.zipCode)
        options.zipcode = self.data.zipCode;

    UseraddressService.update(options, function (err, data) {
        // Error
        if (err) {
            if (data) {
                self.respond(data);
                return;
            } else {
                self.respond({'code': '1001', 'message': '更新收货地址失败'});
                return;
            }
        } else {
            // Return results
            self.respond({'code': '1000', 'message': 'success'});
            if (U.parseInt(self.data.type) === 1) {
                var newaddId = options.id;
                var Qoptions = {'userid': self.data.userId, 'type': 1};
                UseraddressService.query(Qoptions, function (err, data) {
                    var items = data.items;
                    var count = data.count;
                    for (var i = 0; i < count; i++) {
                        var item = items[i];
                        if (newaddId !== item.id) {
                            var updateitem = {'userid': item.userid, 'type': 2, 'id': item.id};
                            data.items[i].type = 2;
                            UseraddressService.update(data.items[i], function (err, data) {
                                if (err) {
                                    var printerror = ['重置用户', item.userid.toString(), '默认收货地址出错'];
                                    console.error(printerror.join(''));
                                }
                            }, true);
                        }
                    }
                });
            }
        }
    }, true);
}

// Delete useraddress
function json_useraddress_remove() {
    var self = this;
    var callbackName = self.data['callback'] || 'callback';
    var options = {};

    if (self.data.userId)
        options.userid = self.data.userId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    if (self.data.addressId)
        options.id = self.data.addressId;
    else {
        self.respond({'code': '1001', 'message': '请求参数错误，无效的addressId参数'});
        return;
    }
    UseraddressService.remove(options, function (err, data) {
        // Error
        if (err) {
            if (data) {
                self.respond(data);
                return;
            } else {
                self.respond({'code': '1001', 'message': '删除收货地址失败'});
                return;
            }
        } else {
            // Return results
            self.respond({'code': '1000', 'message': 'success'});
        }
    });
}

function json_public_key(){
    var self = this;
    var data = {'public_key': F.global.key.exportKey('pkcs8-public-pem'), 'code':1000};
    self.respond(data);
}

function getDefaultAddress(addresses){
    for(var i=0; i<addresses.length; i++){
        if(addresses[i].type == 1){
            return {"country": `${addresses[i].areaName}${addresses[i].cityName}${addresses[i].countyName||''}${addresses[i].townName||''}` , "address":addresses[i].address };
        }
    }

    if(addresses.length){
    	return {"country": `${addresses[0].areaName}${addresses[0].cityName}${addresses[0].countyName||''}${addresses[0].townName||''}` , "address":addresses[0].address };
    }

    return null;
}

// user sign for app
function process_user_sign(){
    var self = this;
    var options = {};
    if(!self.data.userId || self.data.userId.trim()===''){
        self.respond({code:'1001', message:'无效用户ID'});
        return;
    }
    options.userid = self.data.userId;
    //get user
    UserService.get(options, function(err, data){
        // Error
        if (err) {
            self.respond({'code': '1001', 'message': err});
            return;
        }

        var options = {};
        var beijingTimeNow = moment().tz('Asia/Shanghai');
        var id_date = self.data.userId + '_' + beijingTimeNow.format('YYYYMMDD');
        options.id_date = id_date;
        options.datetime = beijingTimeNow;

        // insert into mongodb, id_date must be unique key
        UserSignService.insert(options, function (err) {
            if (err) {
                // insert fail
                if(11000 == err.code){
                    // dup key, there is already a record with options.id_date
                    self.respond({code: '1010', message: '您今日已签到成功，明天再来呦！'});
                }else{
                    // other errors, don't know how to handle it, log to console.
                    console.error('user process_user_sign UserSignService insert err:', err);
                    self.respond({code: '1001', message: '签到失败啦，再试一试吧'});
                }
            } else {
                // if insert success, update user table to add points
                UserService.increaseScore({userid:self.data.userId, score: F.config.user_sign_point_add}, function (err) {
                    if (err) {
                        // error happen,
                        // there are 2 cases of error: one is db operation error,
                        // we should rollback User_Sign document insert command
                        // another one is user's not exist, and there will be no harm if we rollback the change.
                        console.error('user sign fail: fail to update User table. Start to rollback, error: ', err);
                        UserSignService.delete({id_date:id_date}, function(error){
                            if(error){
                                // rollback fail, don't know how to handle it, log to console
                                console.error('user_sign document rollback fail, error:', error);
                            }else{
                                self.respond({code: '1001', message: '签到失败，大侠请重新来过'});
                            }
                        });
                    } else {
                        self.respond({code: '1000', message: '签到成功', pointAdded:F.config.user_sign_point_add});
                    }
                }, true)
            }
        });
    });
}

// ==========================================================================
// USER upload(Photo)
// ==========================================================================

// upload photo for app
function uploadPhoto() {
    var self = this;
    var id = '';
    var userId = self.query['userId'];
    var default_extension = '.jpg';
    var type_avail = ['png', 'jpg', "jpeg"];
    if (!userId) {
        self.respond({code:1001, message:'请填写用户ID'});
        return;
    }

    self.files.wait(function(file, next) {
        file.read(function(err, photo) {
            if (err) {
                console.error('uploadPhoto fail:', err);
                self.respond({code:1001,message:'上传失败'});
                return;
            }

            UserService.get({userid:userId}, function(err, data) {
                if (err) {
                    self.respond({code:1001, message:err});
                    return;
                }

                var index = file.filename.lastIndexOf('.');
                file.extension = file.filename.substring(index + 1);
                if (!type_avail.find(file.extension.toLowerCase())) {
                    self.respond({'code': 1001, 'message': '文件格式不正确（必须为.jpg/.png文件）'});
                    return;
                }

                if (file.length > 500*1024) {
                    self.respond({code: 1001, message: '文件大小不得大于500K'});
                    return;
                }

                // Store current file into the HDD
                id = files.insert(file.filename, file.type, photo) + default_extension;
                var imageurl = "/images/original/" + id;
                var oldPhotoId = null;
                if (data.photo) {
                    oldPhotoId = data.photo.substring(data.photo.lastIndexOf('/')+1, data.photo.lastIndexOf('.'));
                }
                // start to update user info
                UserService.update({userid:userId, photo:imageurl}, function(err) {
                    if (err) {
                        console.error('User uploadPhoto fail:', err);
                        self.respond({code:1001, message:'上传失败'});
                        return;
                    }

                    self.respond({code:1000, message:'上传成功', imageUrl:imageurl});

                    // success, delete old photo
                    if (oldPhotoId) {
                        files.remove(oldPhotoId, function(err, data) {
                            if (err) {
                                console.error('User uploadPhoto fail:', err);
                            }
                        });
                    }
                });
            });
        });
    });
}

// user upload(photo) for web
function userUpload() {
    var self = this;
    var id = '';
    var userId = self.query['userId'];
    var default_extension = '.jpg';
    var type_avail = ['png', 'jpg', "jpeg"];
    if (!userId) {
        self.respond({code:1001, message:'请填写用户ID'});
        return;
    }

    self.files.wait(function(file, next) {
        file.read(function(err, photo) {
            if (err) {
                console.error('userUpload fail:', err);
                self.respond({code:1001,message:'上传失败'});
                return;
            }

            UserService.get({userid:userId}, function(err, data) {
                if (err) {
                    // maybe user not find
                    self.respond(data);
                    return;
                }

                var index = file.filename.lastIndexOf('.');
                file.extension = file.filename.substring(index + 1);
                if (!type_avail.find(file.extension.toLowerCase())) {
                    self.respond({'code': 1001, 'message': '文件格式不正确（必须为.jpg/.png文件）'});
                    return;
                }

                if (file.length > 2*1024*1024) {
                    self.respond({code: 1001, message: '文件大小不得大于2MB'});
                    return;
                }

                // Store current file into the HDD
                id = files.insert(file.filename, file.type, photo) + default_extension;
                var imageurl = "/images/original/" + id;
                self.respond({code:1000, message:'上传成功', imageUrl:imageurl});
            });
        });
    });
}

// confirm user upload(photo)
function confirmUpload() {
    var self = this;
    var id = '';
    var userId = self.data['userId'];
    var fileName = self.data['newFile'];
    var default_extension = '.jpg';

    if (!userId) {
        self.respond({code:1001, message:'缺少userId'});
        return;
    }
    if (!fileName) {
        self.respond({code:1001, message:'缺少newFile'});
        return;
    }

    UserService.get({userid:userId}, function(err, data) {
        if (err) {
            // maybe user not find
            self.respond(data);
            return;
        }

        var index = fileName.lastIndexOf('.');
        var fileId = fileName.substring(0,index);
        var oldPhotoId = null;
        if (data.photo) {
            oldPhotoId = data.photo.substring(data.photo.lastIndexOf('/')+1, data.photo.lastIndexOf('.'));
        }

        // Reads specific file by ID
        files.read(fileId, function(err, stream, header) {
            if (err || !stream) {
                console.error('User confirmUpload fail:', err);
                self.respond({code:1001, message:'确认失败'});
                return;
            }

            var imageurl = "/images/original/" + fileId + default_extension;
            // start to update user info
            UserService.update({userid:userId, photo:imageurl}, function(err, data) {
                if (err) {
                    console.error('User confirmUpload fail:', err);
                    self.respond({code:1001, message:'确认失败'});
                    return;
                }
                self.respond({code:1000, message:'确认成功', imageUrl:imageurl});

                // success, delete old photo
                if (oldPhotoId) {
                    files.remove(oldPhotoId, function(err, data) {
                        if (err) {
                            console.error('User confirmUpload fail:', err);
                        }
                    });
                }
                return;
            }, true);
        });
    });
}

// ==========================================================================
// USER INVITER
// ==========================================================================

function process_bind_inviter(){
    var self = this;
    if(!self.data.inviter){
        self.respond({code:1001,message:'请填写邀请人手机号'});
        return;
    }

    if(!self.data.userId){
        self.respond({code:1001,message:'请填写用户ID'});
        return;
    }

    //check if the userId is a valid user
    UserService.get({userid:self.data.userId}, function(err, data) {
        if (err) {
            // maybe user not find
            self.respond({code:1001,message:err});
            return;
        }

        if(data.inviter){
            // already has inviter
            self.respond({code:1002, message:'已经绑定过邀请人，请勿重复操作'});
            return;
        }

        //check if the inviter is a valid user
        UserService.get({account:self.data.inviter}, function(err, data) {
            if (err) {
                // maybe user not find
                self.respond({code:1001,message:'该手机号未注册，请重新输入'});
                return;
            }

            // update user to add inviter to user
            UserService.update({userid:self.data.userId, inviter:data._id, dateinvited:new Date()}, function(err){
                if(err){
                    console.error('User bind inviter fail:', err);
                    self.respond({code:1001, message:'添加邀请人失败'});
                    return;
                }

                self.respond({code:1000, message:'success'});
            })
        });
    });
}

function json_get_invitee() {
    var self = this;
    var options = {};
    if (self.data['page']) {
        options.page =  self.data['page'];
    }
    if (self.data['max']) {
        options.max = self.data['max'];
    }
    options._id = self.user._id;
    UserService.getInvitee(options, function(err, result) {
        if (err) {
            console.error('user json_get_invitee err:', err);
            self.respond({code:1001, message:'无法获取被邀请人列表'});
            return;
        }

        var invitees = [];
        var data = result.items;
        if (data && data.length > 0) {
            var inviteeIds = [];
            for (var i=0; i<data.length; i++) {
                var user = data[i];
                var invitee = {};
                invitee.userId = user.id;
                invitee.account = user.account;
                invitee.nickname = user.nickname;
                invitee.name = user.name;
                invitee.dateinvited = user.dateinvited;
                invitee.photo = user.photo;
                invitee.newOrdersNumber = 0;
                invitees.push(invitee);
                inviteeIds.push(user.id);
            }

            // get invitee new orders number
            if (inviteeIds && inviteeIds.length > 0) {
                UserService.getInviteeOrderNumber(inviteeIds, function (err, inviteeOrderData) {
                    if (err) {
                        console.error('user json_get_invitee getInviteeOrderNumber err:', err);
                        self.respond({code:1001, message:'获取被邀请人列表错误'});
                        return;
                    }

                    if (inviteeOrderData) {
                        var inviteeOrders = {};
                        for (var i=0; i<inviteeOrderData.length; i++) {
                            var inviteeOrder = inviteeOrderData[i];
                            inviteeOrders[inviteeOrder.userId] = inviteeOrder;  
                        }
                        for (var i=0; i<invitees.length; i++) {
                            var userId = invitees[i].userId;
                            if (inviteeOrders && inviteeOrders[userId]) {
                                invitees[i].newOrdersNumber = inviteeOrders[userId].numberForInviter;
                            }
                        }
                    }
                    self.respond({code:1000, message:'success', invitee:invitees, total:result.count, page:result.page, pages:result.pages});
                });
            }
        } else {
            self.respond({code:1000, message:'success', invitee:invitees, total:0, page:0, pages:0});
        }
    });
}

// get the invitee's orders by one inviter
function json_get_invitee_orders() {
    var self = this;
    if(!self.data.inviteeId) {
        self.respond({code:1001, message:'请填写客户ID'});
        return;
    }
    UserService.getOneInvitee({_id:self.user._id, inviteeId:self.data.inviteeId}, function(err, user) {
        if (err) {
            console.error('user json_get_invitee err:', err);
            self.respond({code:1001, message:'获取客户信息失败'});
            return;
        }

        if (!user) {
            self.respond({code:1001, message:'只能获取自己客户的订单'});
            return;
        }

        var options = {};
        options.buyer = user.id;
        options.type = -1;
        if (self.data['page']) {
            options.page =  self.data['page'];
        }
        if (self.data['max']) {
             options.max = self.data['max'];
        }

        OrderService.query(options, function(err, data) {
            if (err) {
                console.error('User json_get_invitee_orders err:', err);
                self.respond({code:1001, message:'获取客户订单失败'});
                return;
            }

            var result = {};
            if (data) {
                var items = data.items;
                var length = items.length;
                var arr = new Array(length);
                for (var i = 0; i < length; i++) {
                    var item = items[i];
                    var typeValue = OrderService.orderType(item);
                    arr[i] = {
                        'typeValue':typeValue,
                        'orderId':item.id,
                        'totalPrice':item.price.toFixed(2),
                        'goodsCount': item.products ? item.products.length: 0,
                        'address':item.consigneeAddress,
                        'recipientName':item.consigneeName,
                        'recipientPhone':item.consigneePhone,
                        'deposit':item.deposit.toFixed(2),
                        'dateCreated': item.dateCreated,
                        'products': item.products || []
                    };
                }
                result = {'code':1000,'message':'success',
                            'datas':{
                                "account":user.account,
                                "nickname":user.nickname,
                                "name":user.name,
                                "total":data.count,
                                "rows":arr,
                                "page":data.page,
                                "pages":data.pages
                            }
                        };
            } else {
                result = {'code':1000,'message':'success',
                            'datas':{
                                "account":user.account,
                                "nickname":user.nickname,
                                "name":user.name,
                                "total":0,"rows":[],"page":0,"pages":0
                            }
                        };
            }
            self.respond(result);
            UserService.emptyInviteeOrderNumber({inviteeId:user.id});
        }); 
        
    });
}

function isAlive() {
    var self = this;
    self.respond({code:1000, message:'isAlive'});
}

function isInWhiteList() {
    var self = this;
    if (self.user && self.user.inWhiteList) {
        self.respond({code:1000, message:'true'});
        return;
    }
    self.respond({code:1001, message:'false'});
}

function json_usertypes_get() {
    var self = this;
    self.respond({code: 1000, data: F.global.usertypes});
}