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
var vCodeService = services.vCode;
var IntentionProductService = services.intention_product;
var PotentialCustomerService = services.potential_customer;
var LoyaltypointService = services.loyaltypoint;
var REG_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|IOS/i;
var config = require('../config');
var Global = require('../global.js');

exports.install = function() {
	// LOGIN
	//F.route('/api/v2.0/user/login/', 				    process_login, ['get', 'post']);
	//F.route('/logout/', 						        process_logout);

	// REGISTER
	//F.route('/api/v2.0/user/register/', 				process_register, ['get', 'post']);

	// USER
	//F.route('/api/v2.0/user/get/',					    json_user_get, ['get', 'post'], ['isLoggedIn']);
	//F.route('/api/v2.0/user/resetpwd/',				    process_resetpwd, ['get', 'post']);
	//F.route('/api/v2.0/user/modifypwd/',				json_user_modifypwd, ['get','post'], ['isLoggedIn']);
	//F.route('/api/v2.0/user/modify/',				    json_user_modify, ['get', 'post'], ['isLoggedIn']);
	//F.route('/api/v2.0/point/findPointList/',		    json_userscore_get, ['get', 'post'], ['isLoggedIn']);
    //F.route('/api/v2.0/user/findAccount/',              json_user_findaccount, ['get', 'post']);
    //F.route('/api/v2.0/user/bindInviter',               process_bind_inviter, ['get','post'], ['isLoggedIn']);
    //F.route('/api/v2.0/user/getInviter',                json_get_inviter, ['get'], ['isLoggedIn'])
    // order by name pinyin
    //F.route('/api/v2.0/user/getInviteeOrderbyName',     json_get_inviteeOrderbynamePinyin, ['get'], ['isLoggedIn']);
    //F.route('/api/v2.0/user/getInvitee',                json_get_invitee, ['get', 'post'], ['isLoggedIn']);
    //F.route('/api/v2.0/user/getInviteeOrders',          json_get_invitee_orders, ['get', 'post'], ['isLoggedIn']);
    //F.route('/api/v2.0/usertypes',                      json_usertypes_get, ['get']);

	// User Address
	//F.route('/api/v2.0/user/getUserAddressList/',	    json_useraddresslist_query, ['get', 'post'],['isLoggedIn']);
	//F.route('/api/v2.0/user/saveUserAddress/',		    json_useraddress_create, ['get', 'post'],['isLoggedIn']);
	//F.route('/api/v2.0/user/updateUserAddress/',		json_useraddress_update, ['get', 'post'],['isLoggedIn']);
	//F.route('/api/v2.0/user/deleteUserAddress/',		json_useraddress_remove, ['get', 'post'],['isLoggedIn']);

    // RSA public key
    //F.route('/api/v2.0/user/getpubkey/',                json_public_key, ['get', 'post']);

    // Use sign
    //F.route('/api/v2.0/user/sign/',                     process_user_sign, ['get','post'], ['isLoggedIn']);

    // upload user photo for app
    //F.route('/api/v2.0/user/uploadPortrait',            uploadPhoto, ['post', 'upload'], 1024*20, ['isLoggedIn']);
    // upload user photo for web
    //F.route('/api/v2.0/user/upload',                    userUpload, ['post', 'upload'], 1024*20, ['isLoggedIn']);
    // confirm user photo for web
    //F.route('/api/v2.0/user/confirmUpload',             confirmUpload, ['get', 'post'], ['isLoggedIn']);

    //F.route('/api/v2.0/user/isAlive',                   isAlive, ['get'], ['isLoggedIn']);

    // check user in white list
    //F.route('/api/v2.0/user/isInWhiteList',             isInWhiteList, ['get', 'post'], ['isLoggedIn', 'isInWhiteList']);

    // potential customer/intention products related APIs
    //F.route('/api/v2.1/intentionProducts',              json_intention_products, ['get'], ['isLoggedIn', 'isXXNRAgent']);
    //F.route('/api/v2.1/potentialCustomer/isAvailable',  json_potential_customer_available, ['get'], ['isLoggedIn', 'isXXNRAgent']);
    //F.route('/api/v2.1/potentialCustomer/add',          process_add_potential_customer, ['post'], ['isLoggedIn', 'isXXNRAgent']);
    //F.route('/api/v2.1/potentialCustomer/query',        json_potential_customer, ['get'], ['isLoggedIn', 'isXXNRAgent']);
    // order by name pinyin
    //F.route('/api/v2.1/potentialCustomer/queryAllOrderbyName',     json_potential_customer_orderby_namePinyin, ['get'], ['isLoggedIn', 'isXXNRAgent']);
    // Whether order by name pinyin is latest
    //F.route('/api/v2.1/potentialCustomer/isLatest',     json_potential_customer_islatest, ['get'], ['isLoggedIn', 'isXXNRAgent']);
    //F.route('/api/v2.1/potentialCustomer/get',          json_potential_customer_get, ['get'], ['isLoggedIn', 'isXXNRAgent']);

    //F.route('/api/v2.1/user/getNominatedInviter',       json_nominated_inviter_get, ['get'], ['isLoggedIn']);

    // user consignees
    //F.route('/api/v2.2/user/queryConsignees',           json_userconsignees_query, ['get'], ['isLoggedIn']);
    //F.route('/api/v2.2/user/saveConsignees',            process_userconsignees_save, ['get', 'post'], ['isLoggedIn']);

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
if(!Global.key){
    var key = null;
    if(config.isDebug){
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

    Global.key = key;
}

Global.usertypes = config.user_types;
Global.default_user_type = config.default_user_type;

// ==========================================================================
// LOGIN
// ==========================================================================

var files = DB('files', null, require('../modules/database/database').BUILT_IN_DB).binary;

// Login
exports.process_login = function(req, res, next) {
    var options = {};
    if (!req.data.account){
        res.respond({code:1001,message:'请输入账号'});
        return;
    }

    if (!req.data.password){
        res.respond({code:1001,message:'请输入密码'});
        return;
    }

    options.account = req.data.account;
    if (req.data.password) {
        options.password = tools.decrypt_password(decodeURI(req.data.password));
    }

    var keepLogin = !(req.data.keepLogin === 'false');
    options.useragent = req.data["user-agent"] || 'web';
    options.ip = req.ip;
    UserService.login(options, function (err, data) {
        // Error
        if (err) {
            console.error('user process_login fail:', err);
            res.respond({code:1001, message:err});
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
		user.userAddress = data.address;
        user.isUserInfoFullFilled = data.isUserInfoFullFilled;

        convert_user_type_info(user, data);
        CartService.getOrAdd(user.userid, function(err, cart){
            if(err){
                res.respond({code:1001, message:'获取购物车id失败'});
                return;
            }

            user.cartId = cart.cartId;
            setCookieAndResponse(req, res, user, keepLogin);
        }, false);
    });
};

var setCookieAndResponse = function(req, res, user, keepLogin){
    // Set cookie
    var options = {userid:user.userid};
    var userAgent = req.data['user-agent'];
    if(REG_MOBILE.test(userAgent)){
        // is app
        options.appLoginId = U.GUID(10);
        // app login agent
        var appLoginAgent = tools.testUserAgent(userAgent);
        if (appLoginAgent) {
            options.appLoginAgent = appLoginAgent;
        }
    }else{
        // is web
        options.webLoginId = U.GUID(10);
    }

    var token = tools.generate_token(user.userid, options.appLoginId, options.webLoginId);
    UserService.update(options, function(err){
        if(err){
            console.error('setCookieAndResponse err:', err);
            res.respond({code:1001, message:'登录失败'});
            return;
        }

        var cookieUserInfo = {userid: user.userid, loginName: user.loginName};
        if (user && user.nickname && user.nickname.length > 0) {
            cookieUserInfo.nickName = encodeURIComponent(user.nickname);
        }
        if(keepLogin){
            if(config.isDebug){
                res.cookie(config.usercookie, JSON.stringify(cookieUserInfo), {expires: new Date().add(config.usercookie_expires_in)});
                res.cookie(config.tokencookie, token, {expires: new Date().add(config.token_cookie_expires_in)});
            }else {
                res.cookie(config.usercookie, JSON.stringify(cookieUserInfo), {expires:new Date().add(config.usercookie_expires_in), domain: config.domain});
                res.cookie(config.tokencookie, token, {expires:new Date().add(config.token_cookie_expires_in), domain: config.domain});
            }
        }else{
            if(config.isDebug){
                res.cookie(config.usercookie, JSON.stringify(cookieUserInfo));
                res.cookie(config.tokencookie, token);
            }else {
                res.cookie(config.usercookie, JSON.stringify(cookieUserInfo), {domain: config.domain});
                res.cookie(config.tokencookie, token, {domain: config.domain});
            }
        }


        // user shopping carts
        CartService.getOrAdd(user.userid, function(err, cart) {
            var shoppingCart_count = 0;
            if (err) {
                console.error('setCookieAndResponse CartService set shopoingcart err:', err);
            } else {
                if (cart && cart.SKU_items && cart.SKU_items.length>0) {
                    cart.SKU_items.forEach(function (item) {
                        if(item && item.count) {
                            shoppingCart_count += item.count;
                        }
                    });
                }
            }

            if (config.isDebug) {
                res.cookie(config.shopingCartcookie, shoppingCart_count);
            } else {
                res.cookie(config.shopingCartcookie, shoppingCart_count, {domain: config.domain});
            }

            // Return results
            var result = {'code': '1000', 'message': 'success', 'datas': user, token:token};
            res.respond(result);
            return;
        }, true);

        // // Return results
        // var result = {'code': '1000', 'message': 'success', 'datas': user, token:token};
        // res.respond(result);
    });
};

// Logout
/*function process_logout() {
	var self = this;
	self.res.cookie(config.usercookie, '', new Date().add('-1 year'));
	self.redirect('/');
}*/

// ==========================================================================
// REGISTER
// ==========================================================================

// Register
exports.process_register = function(req, res, next) {
    var options = {};
    var keepLogin = req.data.keepLogin || true; //是否保存登录状态，默认保存
    if (!req.data.account || !tools.isPhone(req.data.account.toString())) {
        res.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
        return;
    }
    if (!req.data.smsCode) {
        res.respond({'code': '1001', 'message': '请输入验证码'});
        return;
    }
    if (!req.data.password) {
        res.respond({'code': '1001', 'message': '请输入密码'});
        return;
    }

    var decrypted = tools.decrypt_password(decodeURI(req.data.password));
    if (decrypted.length < 6) {
        res.respond({'code': '1001', 'message': '密码长度需不小于6位'});
        return;
    }
    options.account = req.data.account;
    options.smsCode = req.data.smsCode;
    options.password = decrypted;
    if (req.data.regMethod)
        options.regMethod = req.data.regMethod;
    if (req.data.nickname)
        options.nickname = req.data.nickname;
    options.ip = req.ip;
    options.useragent = req.data["user-agent"] || 'web';

    var vcodeoptions = {'target': req.data.account.toString(), 'code_type': 'register', 'code': req.data.smsCode};
    vCodeService.verify(vcodeoptions, function(err, result){
        if (err || !result) {
            res.respond({'code': '1001', 'message': '验证码验证错误'});
            return;
        } else {
            if (result && result.type === 1) {
                UserService.create(options, function (err, data) {
                    // Error
                    if (err) {
                        res.respond({'code': '1001', 'message': err});
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

                        setCookieAndResponse(req, res, user, keepLogin);
                    }
                }, true);
            } else {
                res.respond({'code': '1001', 'message': result.data});
                return;
            }
        }
    }, true);
};

// ==========================================================================
// USER
// ==========================================================================

// Reset password
exports.process_resetpwd = function(req, res, next) {
    var options = {};

    if (!req.data.account || !tools.isPhone(req.data.account.toString())) {
        res.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
        return;
    }
    if (!req.data.smsCode) {
        res.respond({'code': '1001', 'message': '请输入验证码'});
        return;
    }
    if (!req.data.newPwd) {
        res.respond({'code': '1001', 'message': '请输入密码'});
    }
    var decrypted = tools.decrypt_password(decodeURI(req.data.newPwd));
    if (decrypted.length < 6) {
        res.respond({'code': '1001', 'message': '密码长度需不小于6位'});
        return;
    }
    options.account = req.data.account;
    options.smsCode = req.data.smsCode;
    options.password = decrypted;
    options.ip = req.ip;

    vcodeoptions = {'target': req.data.account.toString(), 'code_type': 'resetpwd', 'code': req.data.smsCode};
    vCodeService.verify(vcodeoptions, function(err, result){
        if (err || !result) {
            res.respond({'code': '1001', 'message': '验证码验证错误'});
            return;
        } else {
            if (result && result.type === 1) {
                UserService.update(options, function (err) {
                    // Error
                    if (err) {
                        res.respond({'code': '1001', 'message': '密码修改失败'});
                        return;
                    } else {
                        // Return results
                        res.respond({'code': '1000', 'message': 'success'});
                    }
                });
            } else {
                res.respond({'code': '1001', 'message': result.data});
                return;
            }
        }
    }, true);
};

// Get user
exports.json_user_get = function(req, res, next) {
    req.data.id = req.data.userId = (req.data.id || req.data.userId);
    var options = {};

    if (req.data.id)
        options.userid = req.data.id;
    options.ip = req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
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
        user.pointLaterTrade = data.score || 0;
        user.dateinvited = data.dateinvited;
        user.address = data.address;
        user.isUserInfoFullFilled = data.isUserInfoFullFilled;
        convert_user_type_info(user, data);
        if (data.inviter) {
            user.inviterId = data.inviter.id;
            user.inviter = data.inviter.account;
            user.inviterPhoto = data.inviter.photo;
            user.inviterNickname = data.inviter.nickname;
            user.inviterName = data.inviter.name;
        }

        var flags = req.data['flags'];
        var respond = function (user) {
            res.respond({'code': '1000', 'message': 'success', 'datas': user});
        };

        if (!flags) {
            // Return results
        }
        else {
            var responds = {};

            if (flags.indexOf('score') >= 0) {
                responds['score'] = (respond);
                respond = function (user) {
                    json_userscore_get(req, res, next, function (score) {
                        user.score = score;
                        // console.log('user = ' + JSON.stringify(user));
                        responds['score'](user);
                    });
                };
            }

            if (flags.indexOf('address') >= 0) {
                responds['address'] = respond;
                respond = function (user) {
                    json_useraddresslist_query(req, res, next, function (addresses) {
                        user.addresses = addresses;
                        user.defaultAddress = getDefaultAddress(addresses);
                        responds['address'](user);
                    });
                };
            }
        }

        respond(user);
    });
};

// Get user score
var json_userscore_get = function(req, res, next, callback) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    options.ip = req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
            return;
        }

        // Return data
        var score = data.score || 0;
        callback ? callback(score) : res.respond({'code': '1000', 'message': 'success', 'datas': {"total": 0, "userId": data.id, "pointLaterTrade": (score || 0), "score":(score || 0), "rows": []}});
    });
};

exports.json_userscore_get = function(req, res, next){
    json_userscore_get(req, res, next);
};

// Modify user password
exports.json_user_modifypwd = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    if (!req.data.oldPwd) {
        res.respond({'code': '1001', 'message': '请输入旧密码'});
        return;
    }
    if (!req.data.newPwd) {
        res.respond({'code': '1001', 'message': '请输入新密码'});
    }
    var decryptedNewPwd = tools.decrypt_password(decodeURI(req.data.newPwd));
    var decryptedOldPwd = tools.decrypt_password(decodeURI(req.data.oldPwd));
    if (decryptedNewPwd.length < 6) {
        res.respond({'code': '1001', 'message': '新密码长度需不小于6位'});
        return;
    }
    if (decryptedNewPwd === decryptedOldPwd) {
        res.respond({'code': '1001', 'message': '新密码与旧密码不能一致'});
        return;
    }

    options.password = decryptedNewPwd;
    options.ip = req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
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
                    res.respond({'code': '1001', 'message': '密码修改失败'});
                    return;
                } else {
                    // Return results
                    res.respond({'code': '1000', 'message': 'success'});
                    return;
                }
            });
        } else {
            res.respond({'code': '1001', 'message': '旧密码输入错误'});
            return;
        }
    });
};

// modify user info
exports.json_user_modify = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    if (req.data.userName)
        options.name = req.data.userName;
    if (req.data.nickName) {
        //if(req.data.nickName.length > 6) {
        if (tools.getStringLen(req.data.nickName, 12)) {
            res.respond({'code': '1001', 'message': '昵称输入过长'});
            return;
        } else {
            options.nickname = req.data.nickName;
        }
    }
    if (req.data.userPhoto)
        options.photo = req.data.userPhoto;
    if (req.data.sex)
        options.sex = req.data.sex;
    options.ip = req.ip;
	if (req.data.type) {
        if(!Global.usertypes[req.data.type]){
            res.respond({code:1001, message:'未查询到用户类型'});
            return;
        }

        options.type = req.data.type;
    }

    UserService.get({userid:req.data.userId}, function(err, old_user_info){
        var callback = function (err) {
            // Error
            if (err) {
                res.respond({'code': '1001', 'message': err});
                return;
            }

            // Return results
            if(!old_user_info.isUserInfoFullFilled){
                UserService.get({userid:req.data.userId}, function(err, new_user_info) {
                    if (new_user_info.name && new_user_info.address && new_user_info.address.province && new_user_info.type) {
                        UserService.update({userid:req.data.userId, isUserInfoFullFilled: true}, function (err, data) {
                            // UserService.increaseScore({userid: req.data.userId, score: config.user_info_full_filled_point_add}, function (err) {
                            var points = config.user_info_full_filled_point_add;
                            LoyaltypointService.increase(old_user_info._id, points, 'ORGANIZINGINFO', null, null, function (err) {
                                var response = {'code': '1000', 'message': 'success'};
                                if (!err) {
                                    response.scoreAdded = points;
                                }

                                res.respond(response);
                            });
                        });
                    } else {
                        res.respond({'code': '1000', 'message': 'success'});
                    }
                })
            } else{
                res.respond({'code': '1000', 'message': 'success'});
            }
        };
        if (req.data.address && req.data.address.provinceId && req.data.address.cityId) {
            var address = req.data.address;
            options.address = {};
            AreaService.getProvince({id: address.provinceId}, function (err, province) {
                if (err || !province) {
                    if (err) console.error('get province err:', err);
                    res.respond({code: 1001, message: '没有查到要修改的省'});
                    return;
                }

                options.address.province = province;
                AreaService.getCity({id: address.cityId}, function (err, city) {
                    if (err || !city) {
                        if (err) console.error('get city err:', err);
                        res.respond({code: 1001, message: '没有查到要修改的市'});
                        return;
                    }

                    options.address.city = city;
                    if (req.data.address.countyId) {
                        AreaService.getCounty({id: address.countyId}, function (err, county) {
                            if (err || !county) {
                                if (err) console.error('get county err:', err);
                                res.respond({code: 1001, message: '没有查到要修改的县'});
                                return;
                            }

                            options.address.county = county;
                            if (address.townId) {
                                AreaService.getTown({id: address.townId}, function (err, town) {
                                    if (err || !town) {
                                        if (err) console.error('get town err:', err);
                                        res.respond({code: 1001, message: '没有查到要修改的乡镇'});
                                        return;
                                    }

                                    options.address.town = town;
                                    UserService.update(options, callback);
                                });
                            } else {
                                UserService.update(options, callback);
                            }
                        })
                    } else if (address.townId) {
                        AreaService.getTown({id: address.townId}, function (err, town) {
                            if (err || !town) {
                                if (err) console.error('get town err:', err);
                                res.respond({code: 1001, message: '没有查到要修改的乡镇'});
                                return;
                            }

                            options.address.town = town;
                            UserService.update(options, callback);
                        });
                    } else {
                        UserService.update(options, callback);
                    }
                });
            });
        } else{
            UserService.update(options, callback);
        }
    });
};

// Find Account in users
exports.json_user_findaccount = function(req, res, next) {
    var options = {};

    if (req.data.account)
        options.account = req.data.account;
    options.ip = req.ip;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
            return;
        }

        res.respond({'code': '1000', 'message': 'success'});
    });
};

// ==========================================================================
// User Address
// ==========================================================================

var json_useraddresslist_query = function(req, res, next ,callback){
    var options = {};

    if (!req.data.userId) {
        res.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    options.userid = req.data.userId;
    options.ip = req.ip;

    UseraddressService.query(options, function (err, data) {
        // Error
        if (err) {
            console.error('user json_useraddresslist_query UseraddressService query err:', err);
            if (data) {
                res.respond(data);
                return;
            } else {
                res.respond({'code': '1001', 'message': '未查询到收货地址'});
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
            callback ? callback(arr) : res.respond({'code': '1000', 'message': 'success', 'datas': {"total": count, "rows": arr}});
        }
    });
};

// Query useraddress list
exports.json_useraddresslist_get = function(req, res, next) {
    json_useraddresslist_query(req, res, next);
};

// Create useraddress
exports.json_useraddress_create = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    else {
        res.respond({code: 1001, message: '请求参数错误，无效的userId参数'});
        return;
    }
    if (req.data.address)
        options.address = req.data.address;
    else {
        res.respond({code: 1001, message: '请求参数错误，无效的address参数'});
        return;
    }
    if (req.data.areaId)
        options.provinceid = req.data.areaId;
    else {
        res.respond({code: 1001, message: '请求参数错误，无效的areaId参数'});
        return;
    }
    if (req.data.cityId)
        options.cityid = req.data.cityId;
    if (req.data.countyId)
        options.countyid = req.data.countyId;
    if (req.data.townId)
        options.townid = req.data.townId;
    if (req.data.receiptPhone) {
        if (!tools.isPhone(req.data.receiptPhone.toString())) {
            res.respond({code: 1001, message: '请输入正确的11位手机号'});
            return;
        }
        options.receiptphone = req.data.receiptPhone;
    }
    else {
        res.respond({code: 1001, message: '请求参数错误，无效的receiptPhone参数'});
        return;
    }
    if (req.data.receiptPeople)
        options.receiptpeople = req.data.receiptPeople;
    else {
        res.respond({code: 1001, message: '请求参数错误，无效的receiptPeople参数'});
        return;
    }
    if (req.data.type && U.parseInt(req.data.type) === 1)
        options.type = 1;
    else
        options.type = 2;

    if (req.data.zipCode)
        options.zipcode = req.data.zipCode;


    UseraddressService.create(options, function (err, result) {
        // Error
        if (err) {
            console.error('user json_useraddress_create UseraddressService create err:', err);
            if (result) {
                res.respond(result);
                return;
            } else {
                res.respond({code: 1002, message: '保存收货地址失败'});
                return;
            }
        } else {
            // Return results
            res.respond({code: 1000, message: 'success', datas:{addressId: result.id}});
            if (U.parseInt(req.data.type) === 1) {
                var Qoptions = {'userid': req.data.userId, 'type': 1};

                UseraddressService.query(Qoptions, function (err, data) {
                    if (err) {
                        console.error('user json_useraddress_create UseraddressService query err:', err);
                        return;
                    }
                    var items = data.items;
                    var count = data.count;
                    for (var i = 0; i < count; i++) {
                        var item = items[i];
                        if (result.id !== item.id) {
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
};

// Update useraddress
exports.json_useraddress_update = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    else {
        res.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    if (req.data.addressId)
        options.id = req.data.addressId;
    else {
        res.respond({'code': '1001', 'message': '请求参数错误，无效的addressId参数'});
        return;
    }
    if (req.data.address)
        options.address = req.data.address;
    if (req.data.areaId)
        options.provinceid = req.data.areaId;
    if (req.data.cityId)
        options.cityid = req.data.cityId;
    if (req.data.countyId)
        options.countyid = req.data.countyId;
    if (req.data.townId)
        options.townid = req.data.townId;
    if (req.data.receiptPhone) {
        if (!tools.isPhone(req.data.receiptPhone.toString())) {
            res.respond({'code': '1001', 'message': '请输入正确的11位手机号'});
            return;
        }
        options.receiptphone = req.data.receiptPhone;
    }
    if (req.data.receiptPeople)
        options.receiptpeople = req.data.receiptPeople;
    if (req.data.type) {
        if (U.parseInt(req.data.type) === 1)
            options.type = 1;
        else
            options.type = 2;
    }

    if (req.data.zipCode)
        options.zipcode = req.data.zipCode;

    UseraddressService.update(options, function (err, data) {
        // Error
        if (err) {
            if (data) {
                res.respond(data);
                return;
            } else {
                res.respond({'code': '1001', 'message': '更新收货地址失败'});
                return;
            }
        } else {
            // Return results
            res.respond({'code': '1000', 'message': 'success'});
            if (U.parseInt(req.data.type) === 1) {
                var newaddId = options.id;
                var Qoptions = {'userid': req.data.userId, 'type': 1};
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
};

// Delete useraddress
exports.json_useraddress_remove = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    else {
        res.respond({'code': '1001', 'message': '请求参数错误，无效的userId参数'});
        return;
    }
    if (req.data.addressId)
        options.id = req.data.addressId;
    else {
        res.respond({'code': '1001', 'message': '请求参数错误，无效的addressId参数'});
        return;
    }
    UseraddressService.remove(options, function (err, data) {
        // Error
        if (err) {
            if (data) {
                res.respond(data);
                return;
            } else {
                res.respond({'code': '1001', 'message': '删除收货地址失败'});
                return;
            }
        } else {
            // Return results
            res.respond({'code': '1000', 'message': 'success'});
        }
    });
};

exports.json_public_key = function(req, res, next){
    var data = {'public_key': Global.key.exportKey('pkcs8-public-pem'), 'code':1000};
    res.respond(data);
};

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
exports.process_user_sign = function(req, res, next){
    var options = {};
    if(!req.data.userId || req.data.userId.trim()===''){
        res.respond({code:'1001', message:'无效用户ID'});
        return;
    }
    options.userid = req.data.userId;
    //get user
    UserService.get(options, function(err, user){
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
            return;
        }

        var options = {};
        var beijingTimeNow = moment().tz('Asia/Shanghai');
        var id_date = req.data.userId + '_' + beijingTimeNow.format('YYYYMMDD');
        options.id_date = id_date;
        options.datetime = beijingTimeNow;

        // insert into mongodb, id_date must be unique key
        UserSignService.insert(options, function (err) {
            if (err) {
                // insert fail
                if(11000 == err.code){
                    // dup key, there is already a record with options.id_date
                    res.respond({code: '1010', message: '您今日已签到成功，明天再来呦！'});
                }else{
                    // other errors, don't know how to handle it, log to console.
                    console.error('user process_user_sign UserSignService insert err:', err);
                    res.respond({code: '1001', message: '签到失败啦，再试一试吧'});
                }
            } else {
                // if insert success, update user table to add points
                // UserService.increaseScore({userid:req.data.userId, score: config.user_sign_point_add}, function (err) {
                var points = config.user_sign_point_add;
                var description = beijingTimeNow.format('YYYY-MM-DD') + '签到';
                LoyaltypointService.increase(user._id, points, 'SIGNIN', description, null, function (err) {
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
                                res.respond({code: '1001', message: '签到失败，请重试'});
                            }
                        });
                    } else {
                        res.respond({code: '1000', message: '签到成功', pointAdded:config.user_sign_point_add});
                    }
                }, true)
            }
        });
    });
};

// ==========================================================================
// USER upload(Photo)
// ==========================================================================

// upload photo for app
exports.uploadPhoto = function(req, res, next) {
    var id = '';
    var userId = req.user.id;
    var default_extension = '.jpg';
    var type_avail = ['png', 'jpg', "jpeg"];
    if (!userId) {
        res.respond({code:1001, message:'请填写用户ID'});
        return;
    }

    req.files.forEach(function(file){
        UserService.get({userid:userId}, function(err, data) {
            if (err) {
                res.respond({code:1001, message:err});
                return;
            }

            var index = file.originalname.lastIndexOf('.');
            var extension = file.originalname.substring(index + 1);
            if (!type_avail.find(extension.toLowerCase())) {
                res.respond({'code': 1001, 'message': '文件格式不正确（必须为.jpg/.png文件）'});
                return;
            }

            if (file.size > 500*1024) {
                res.respond({code: 1001, message: '文件大小不得大于500K'});
                return;
            }

            // Store current file into the HDD
            id = files.insert(file.originalname, file.mimetype, file.buffer) + default_extension;
            var imageurl = "/images/original/" + id;
            var oldPhotoId = null;
            if (data.photo) {
                oldPhotoId = data.photo.substring(data.photo.lastIndexOf('/')+1, data.photo.lastIndexOf('.'));
            }
            // start to update user info
            UserService.update({userid:userId, photo:imageurl}, function(err) {
                if (err) {
                    console.error('User uploadPhoto fail:', err);
                    res.respond({code:1001, message:'上传失败'});
                    return;
                }

                res.respond({code:1000, message:'上传成功', imageUrl:imageurl});

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
};

// user upload(photo) for web
exports.userUpload = function(req, res, next) {
    var id = '';
    var userId = req.user.id;
    var default_extension = '.jpg';
    var type_avail = ['png', 'jpg', "jpeg"];
    if (!userId) {
        res.respond({code:1001, message:'请填写用户ID'});
        return;
    }

    req.files.forEach(function(file){
            UserService.get({userid:userId}, function(err, data) {
                if (err) {
                    // maybe user not find
                    res.respond(data);
                    return;
                }

                var index = file.originalname.lastIndexOf('.');
                var extension = file.originalname.substring(index + 1);
                if (!type_avail.find(extension.toLowerCase())) {
                    res.respond({'code': 1001, 'message': '文件格式不正确（必须为.jpg/.png文件）'});
                    return;
                }

                if (file.size > 2*1024*1024) {
                    res.respond({code: 1001, message: '文件大小不得大于2MB'});
                    return;
                }

                // Store current file into the HDD
                id = files.insert(file.originalname, file.mimetype, file.buffer) + default_extension;
                var imageurl = "/images/original/" + id;
                res.respond({code:1000, message:'上传成功', imageUrl:imageurl});
            });
    });
};

// confirm user upload(photo)
exports.confirmUpload = function(req, res, next) {
    var userId = req.data['userId'];
    var fileName = req.data['newFile'];
    var default_extension = '.jpg';

    if (!userId) {
        res.respond({code:1001, message:'缺少userId'});
        return;
    }
    if (!fileName) {
        res.respond({code:1001, message:'缺少newFile'});
        return;
    }

    UserService.get({userid:userId}, function(err, data) {
        if (err) {
            // maybe user not find
            res.respond(data);
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
                res.respond({code:1001, message:'确认失败'});
                return;
            }

            var imageurl = "/images/original/" + fileId + default_extension;
            // start to update user info
            UserService.update({userid:userId, photo:imageurl}, function(err, data) {
                if (err) {
                    console.error('User confirmUpload fail:', err);
                    res.respond({code:1001, message:'确认失败'});
                    return;
                }
                res.respond({code:1000, message:'确认成功', imageUrl:imageurl});

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
};

// ==========================================================================
// USER INVITER
// ==========================================================================

exports.process_bind_inviter = function(req, res, next){
    if(!req.data.inviter){
        res.respond({code:1001,message:'请填写邀请人手机号'});
        return;
    }

    if(!req.data.userId){
        res.respond({code:1001,message:'请填写用户ID'});
        return;
    }

    //check if the userId is a valid user
    UserService.get({userid:req.data.userId}, function(err, data) {
        if (err) {
            // maybe user not find
            res.respond({code:1001,message:err});
            return;
        }

        if(data.inviter){
            // already has inviter
            res.respond({code:1002, message:'已经绑定过邀请人，请勿重复操作'});
            return;
        }

        //check if the inviter is a valid user
        UserService.get({account:req.data.inviter}, function(err, data) {
            if (err) {
                // maybe user not find
                res.respond({code:1001,message:'该手机号未注册，请重新输入'});
                return;
            }

            // update user to add inviter to user
            UserService.update({userid:req.data.userId, inviter:data._id, dateinvited:new Date()}, function(err){
                if(err){
                    console.error('User bind inviter fail:', err);
                    res.respond({code:1001, message:'添加邀请人失败'});
                    return;
                }

                res.respond({code:1000, message:'success'});
                PotentialCustomerService.customerBinded(req.user.account, data._id, function(){})
            })
        });
    });
};

// get user inviter info
exports.json_get_inviter = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;

    UserService.get(options, function (err, data) {
        // Error
        if (err) {
            res.respond({'code': '1001', 'message': err});
            return;
        }
        if (data && data.inviter && data.inviter.id) {
            UserService.get({userid: data.inviter.id}, function (err, inviter) {
                if (err) {
                    res.respond({'code': '1001', 'message': err});
                    return;
                }
                if (inviter) {
                    var user = {};
                    user.inviterId = inviter.id;
                    user.inviterPhone = inviter.account;
                    user.inviterPhoto = inviter.photo;
                    user.inviterNickname = inviter.nickname;
                    user.inviterName = inviter.name;
                    user.inviterSex = inviter.sex;
                    user.inviterAddress = inviter.address;
                    user.inviterUserType = inviter.type;
                    user.inviterUserTypeInName = F.global.usertypes[inviter.type] || '其他';

                    // inviter verified user types
                    user.inviterVerifiedTypes = inviter.typeVerified || [];
                    if (user.inviterVerifiedTypes) {
                        user.inviterVerifiedTypesInJson = [];
                        user.inviterVerifiedTypes.forEach(function(type){
                            if(F.global.usertypes[type]){
                                user.inviterVerifiedTypesInJson.push({typeId:type, typeName: F.global.usertypes[type] || '其他'});
                            }
                        });
                    }
                    user.inviterIsVerified = inviter.isVerified;
                    res.respond({code: '1000', message: 'success', datas: user});
                } else {
                    res.respond({code: '1001', message: '没有找到新农代表信息'});
                    return; 
                }
            });
        } else {
            res.respond({code: '1000', message: '没有找到新农代表信息', datas:{}});
            return;
        }
    });
};

// get user invitee order by namePinyin
exports.json_get_inviteeOrderbynamePinyin = function(req, res, next) {
    var options = {};
    options._id = req.user._id;
    UserService.getInviteeOrderbynamePinyin(options, function(err, result) {
        if (err) {
            console.error('user getInviteeOrderbynamePinyin err:', err);
            res.respond({code:1001, message:'获取被邀请人列表失败'});
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
                invitee.sex = user.sex;
                invitee.newOrdersNumber = 0;
                invitee.namePinyin = user.namePinyin;
                invitee.nameInitial = user.nameInitial;
                invitee.nameInitialType = user.nameInitialType;
                invitees.push(invitee);
                inviteeIds.push(user.id);
            }

            // get invitee new orders number
            if (inviteeIds && inviteeIds.length > 0) {
                UserService.getInviteeOrderNumber(inviteeIds, function (err, inviteeOrderData) {
                    if (err) {
                        console.error('user json_get_invitee getInviteeOrderNumber err:', err);
                        res.respond({code:1001, message:'获取被邀请人列表失败'});
                        return;
                    }

                    if (inviteeOrderData && inviteeOrderData.length > 0) {
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
                    res.respond({code:1000, message:'success', invitee:invitees, total:result.count});
                });
            } else {
                res.respond({code:1000, message:'success', invitee:invitees, total:result.count});
            }
        } else {
            res.respond({code:1000, message:'success', invitee:invitees, total:0});
        }
    });
};

// get user invitee list by page
exports.json_get_invitee = function(req, res, next) {
    var options = {};
    if (req.data['page']) {
        options.page =  req.data['page'];
    }
    if (req.data['max']) {
        options.max = req.data['max'];
    }
    options._id = req.user._id;
    options.search = req.data.search;
    UserService.getInvitee(options, function(err, result) {
        if (err) {
            console.error('user json_get_invitee err:', err);
            res.respond({code:1001, message:'无法获取被邀请人列表'});
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
                invitee.sex = user.sex;
                invitee.newOrdersNumber = 0;
                invitees.push(invitee);
                inviteeIds.push(user.id);
            }

            // get invitee new orders number
            if (inviteeIds && inviteeIds.length > 0) {
                UserService.getInviteeOrderNumber(inviteeIds, function (err, inviteeOrderData) {
                    if (err) {
                        console.error('user json_get_invitee getInviteeOrderNumber err:', err);
                        res.respond({code:1001, message:'获取被邀请人列表错误'});
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
                    res.respond({code:1000, message:'success', invitee:invitees, total:result.count, page:result.page, pages:result.pages});
                });
            }
        } else {
            res.respond({code:1000, message:'success', invitee:invitees, total:0, page:0, pages:0});
        }
    });
};

// get the invitee's orders by one inviter
exports.json_get_invitee_orders = function(req, res, next) {
    if(!req.data.inviteeId) {
        res.respond({code:1001, message:'请填写客户ID'});
        return;
    }
    UserService.getOneInvitee({_id:req.user._id, inviteeId:req.data.inviteeId}, function(err, user) {
        if (err) {
            console.error('user json_get_invitee err:', err);
            res.respond({code:1001, message:'获取客户信息失败'});
            return;
        }

        if (!user) {
            res.respond({code:1001, message:'只能获取自己客户的订单'});
            return;
        }

        var options = {};
        options.buyer = user.id;
        options.type = -1;
        if (req.data['page']) {
            options.page =  req.data['page'];
        }
        if (req.data['max']) {
             options.max = req.data['max'];
        }

        OrderService.query(options, function(err, data) {
            if (err) {
                console.error('User json_get_invitee_orders err:', err);
                res.respond({code:1001, message:'获取客户订单失败'});
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
                        'products': item.products || [],
                        'SKUs': item.SKUs || []
                    };

                    if(arr[i].SKUs && arr[i].SKUs.length > 0){
                        // contains SKUs, need to convert into products to support old app
                        arr[i].SKUs.forEach(function(SKU){
                            var product = {id:SKU.productId, price:SKU.price, deposit:SKU.deposit, name:SKU.productName, thumbnail:SKU.thumbnail, count:SKU.count, category:SKU.category, dateDelivered:SKU.dateDelivered, dateSet:SKU.dateSet, deliverStatus:SKU.deliverStatus};
                            arr[i].products.push(product);
                        })
                    }
                }

                result = {'code':1000,'message':'success',
                            'datas':{
                                "account":user.account,
                                "nickname":user.nickname,
                                "name":user.name,
                                "address":user.address,
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
                                "address":user.address,
                                "total":0,"rows":[],"page":0,"pages":0
                            }
                        };
            }
            res.respond(result);
            UserService.emptyInviteeOrderNumber({inviteeId:user.id});
        }); 
        
    });
};

exports.isAlive = function(req, res, next) {
    res.respond({code:1000, message:'isAlive'});
};

exports.isInWhiteList = function(req, res, next) {
    if (req.user && req.user.inWhiteList) {
        res.respond({code:1000, message:'true'});
        return;
    }
    res.respond({code:1001, message:'false'});
};

exports.json_usertypes_get = function(req, res, next) {
    res.respond({code: 1000, data: Global.usertypes});
};

exports.process_add_potential_customer = function(req, res, next){
    if(!req.data.name){
        res.respond({code:1001, message:'请输入姓名'});
        return;
    }

    if(!req.data.phone || !tools.isPhone(req.data.phone.toString())){
        res.respond({code:1001, message:'请输入正确的手机号'});
        return;
    }

    if(typeof req.data.sex == 'undefined'){
        res.respond({code:1001, message:'请输入性别'});
        return;
    }

    if(typeof req.data.sex == 'string'){
        req.data.sex = (req.data.sex === 'true');
    }

    if(!req.data.address || !req.data.address.province || !req.data.address.city){
        res.respond({code:1001, message:'请选择省市'});
        return;
    }

    if(!req.data.buyIntentions || !req.data.buyIntentions.length < 0){
        res.respond({code:1001, message:'请选择意向商品'});
        return;
    }

    if(req.data.remarks && tools.getStringLen(req.data.remarks.toString(), 60)){
        res.respond({code:1001, message:'备注字数过长，请输入少于30个字'});
        return;
    }

    PotentialCustomerService.add(req.user, req.data.name, req.data.phone, req.data.sex, req.data.address, req.data.buyIntentions, req.data.remarks, function(err){
        if(err){
            res.respond({code:1001, message:err});
            return;
        }

        res.respond({code:1000, message:'success'});
    });
};

exports.json_potential_customer = function(req, res, next){
    var returnType = req.data.type;
    if(!returnType) {
        var page = U.parseInt(req.data.page, 1) - 1;
        var max = U.parseInt(req.data.max, 20);
        PotentialCustomerService.queryPage(req.user, page, max, function (err, potentialCustomers, totalCount, pageCount) {
            if (err) {
                res.respond({code: 1001, message: '获取潜在客户列表失败'});
                return;
            }

            PotentialCustomerService.countLeftToday(req.user, function (err, count) {
                if (err) {
                    res.respond({code: 1001, message: '查询客户列表失败'});
                    return;
                }

                res.respond({
                    code: 1000,
                    message: 'success',
                    count: totalCount,
                    potentialCustomers: potentialCustomers,
                    countLeftToday: count && count > 0 ? count : 0,
                    totalPageNo: pageCount,
                    currentPageNo: page + 1
                });
            });
        });
    }
};

exports.json_potential_customer_orderby_namePinyin = function(req, res, next){
    PotentialCustomerService.queryOrderbynamePinyin(req.user, function (err, potentialCustomers) {
        if (err) {
            res.respond({code: 1001, message: '获取潜在客户列表失败'});
            return;
        }

        res.respond({
            code: 1000,
            message: 'success',
            count: potentialCustomers ? potentialCustomers.length : 0,
            potentialCustomers: potentialCustomers ? potentialCustomers : []
        });
    });
};

exports.json_potential_customer_islatest = function(req, res, next){
    var count = req.data.count || 0;
    PotentialCustomerService.queryOrderbynamePinyin(req.user, function (err, potentialCustomers) {
        if (err) {
            res.respond({code: 1001, message: '获取潜在客户列表失败'});
            return;
        }

        PotentialCustomerService.countLeftToday(req.user, function (err, countLeftToday) {
            if (err) {
                res.respond({code: 1001, message: '查询客户列表失败'});
                return;
            }

            res.respond({
                code: 1000,
                message: 'success',
                count: potentialCustomers ? potentialCustomers.length : 0,
                countLeftToday: countLeftToday && countLeftToday > 0 ? countLeftToday : 0,
                needUpdate: potentialCustomers && parseInt(count) !== potentialCustomers.length ? 1 : 0
            });
        });
    });
};

exports.json_intention_products = function(req, res, next){
    IntentionProductService.query(function(err, products){
        if(err){
            res.respond({code:1001, message:'获取意向商品列表失败'});
            return;
        }

        products.sort(function(a, b){
            if(a.name=='其他')
                return 1;
            else
                return -1;
        });

        res.respond({code:1000, message:'success', intentionProducts:products});
    })
};

exports.json_potential_customer_available = function(req, res, next){
    if(!req.data.phone || !tools.isPhone(req.data.phone.toString())){
        res.respond({code:1001, message:'请填写正确的手机号'});
        return;
    }

    PotentialCustomerService.isAvailable(req.data.phone, function(err, available, message){
        if(err){
            res.respond({code:1001, message:'获取失败'});
            return;
        }

        res.respond({code:1000, available:available, message:message});
    })
};

exports.json_potential_customer_get = function(req, res, next){
    if(!req.data._id){
        res.respond({code:1001, message:'请填写_id'});
        return;
    }

    PotentialCustomerService.getById(req.data._id, function(err, doc){
        if(err){
            res.respond({code:1001, message:'获取客户信息失败'});
            return;
        }

        res.respond({code:1000, message:'success', potentialCustomer:doc});
    })
};

function convert_user_type_info(user, data){
    user.isVerified = data.isVerified;
    user.isXXNRAgent = data.isXXNRAgent;
    user.isRSC = data.isRSC;
    user.RSCInfoVerifing = data.isRSC ? false : (data.RSCInfo ? (data.RSCInfo.name ? true : false) : false);

    // selected user type
    if(!Global.usertypes[data.type]){
        user.isVerified = false;
        data.type = Global.default_user_type;
    }

    user.userType = data.type;
    user.userTypeInName = Global.usertypes[user.userType] || '其他';

    // verified user types
    user.verifiedTypes = data.typeVerified || [];
    if (user.verifiedTypes) {
        user.verifiedTypesInJson = [];
        user.verifiedTypes.forEach(function(type){
            if(Global.usertypes[type]){
                user.verifiedTypesInJson.push({typeId:type, typeName: Global.usertypes[type] || '其他'});
            }
        });
    }
}

exports.json_nominated_inviter_get = function(req, res, next){
    var user = req.user;
    PotentialCustomerService.getByPhone(user.account, function(err, customer){
        if(err){
            res.respond({code:1001, message:'查询失败'});
            return;
        }

        if(!customer || !customer || !customer.user || !customer.user){
            res.respond({code:1404, message:'没有推荐的新农代表'});
            return;
        }

        res.respond({code:1000, message:'success', nominated_inviter:{phone:customer.user.account, name:customer.user.name}});
    })
};

/**
 * query user consignees for ZITI delivery
 * @return {[object]{code:number message:string datas:object}}
 */
exports.json_userconsignees_query = function(req, res, next) {
    var page = req.data['page'];
    var max = req.data['max'];
    var userId = req.data['userId'];

    if (!userId) {
        res.respond({code:1001,message:'缺少用户ID'});
        return;
    }

    var options = {};
    options.userId = userId;
    options.page = page;
    options.max = max;

    UserService.queryUserConsignee(options, function(err, data) {
        if (err || !data) {
            if (err) console.error('User Service json_userconsignees_query queryUserConsignee err:', err);
            res.respond({code:1002,message:'没有找到收货人列表'});
            return;
        }

        res.respond({code:1000,message:'success',datas:{total:data.count,rows:data.items,page:data.page,pages:data.pages}});
    });
};

/**
 * save user consignees
 * @return {[object]{code:number message:string}}
 */
exports.process_userconsignees_save = function(req, res, next) {
    var consigneeName = req.data['consigneeName'];
    var consigneePhone = req.data['consigneePhone'];
    var userId = req.data['userId'];
    if (!userId) {
        res.respond({code:1001,message:'缺少用户ID'});
        return;
    }
    if (!consigneeName) {
        res.respond({code:1001,message:'请先填写收货人姓名'});
        return;
    }
    if (!consigneePhone || !tools.isPhone(consigneePhone)) {
        res.respond({code:1001,message:'请先填写正确的收货人手机号'});
        return;
    }

    // save user input consignee
    var userConsignee = {userId: userId, consigneeName: consigneeName, consigneePhone: consigneePhone};
    UserService.saveUserConsignee(userConsignee, function(err, data) {
        if (err) {
            console.error('User Service process_userconsignees_save saveUserConsignee err:', err);
            if (data) {
                res.respond({code:1002,message:'收货人信息已经存在'});
                return;
            }
            res.respond({code:1002,message:'收货人信息保存失败'});
            return;
        }
        res.respond({code:1000,message:'success'});
        return;
    });
};
