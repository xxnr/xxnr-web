var tools = require('../common/tools');

exports.install = function() {
	// LOGIN
	F.route('/app/user/login/', 				process_login);
	//F.route('/logout/', 						process_logout);

	// REGISTER
	F.route('/app/user/register/', 				process_register);

	// USER
	F.route('/app/user/get/',					json_user_get);
	F.route('/app/user/resetpwd/',				process_resetpwd);
	F.route('/app/point/findPointList/',		json_userscore_get);

	// User Address
	F.route('/app/user/getUserAddressList/',	json_useraddresslist_query);
	F.route('/app/user/saveUserAddress/',		json_useraddress_create);
	F.route('/app/user/updateUserAddress/',		json_useraddress_update);
	F.route('/app/user/deleteUserAddress/',		json_useraddress_remove);

};

// ==========================================================================
// LOGIN
// ==========================================================================

// Login
// http://127.0.0.1:3000/app/user/login?callback=jQuery18208050271789543331_1442214882949&methodname=app%2Fuser%2Flogin&account=18612349999&password=123456789&_=1442214928220
function process_login() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	if (self.query.account)
		options.account = self.query.account;
	if (self.query.password)
		options.password = self.query.password;
	options.ip = self.req.ip;

	GETSCHEMA('User').workflow('login', null, options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'账号或者密码输入错误'});
			}
		}

		var user = {};
		user.userid 	= data.id;
		user.nickname	= data.nickname;
		user.loginName	= data.account;
		user.phone		= data.phone || data.account;
		user.sex 		= data.sex;
		user.potho 		= data.photo;
		user.userType 	= data.type;

		// Set cookie
		self.res.cookie(F.config.usercookie, F.encrypt({ userid: user.userid, ip: self.req.ip }, 'user'), new Date().add('5 minutes'));

		// Return results
		self.jsonp(callbackName, {'code':'1000','message':'success','datas':user});

	}, true);

}

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
//http://127.0.0.1:3000/app/user/register?callback=jQuery18208050271789543331_1442214882949&methodname=app%2Fuser%2Fregister&account=18612341111&password=1234567&smsCode=123456&regMethod=1&_=1442214928220
function process_register() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	var vcodeoptions = {};
	var smsCode = '123456';
	var phoneReg = RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');

	//if (!self.query.account || !phoneReg.test(self.query.account.toString())) {
	if (!self.query.account || !tools.isPhone(self.query.account.toString())) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入正确的11位手机号'});
		return;
	}
	if (!self.query.smsCode) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入验证码'});
		return;
	}
	if (!self.query.password || self.query.password.length < 6) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入至少6位密码'});
		return;
	}
	options.account = self.query.account;
	options.smsCode = self.query.smsCode;
	options.password = self.query.password;
	if (self.query.regMethod)
		options.regMethod = self.query.regMethod;
	if (self.query.nickname)
		options.nickname = self.query.nickname;
	options.ip = self.req.ip;
	vcodeoptions = {'target':self.query.account.toString(),'code_type':'register','code':self.query.smsCode};
	GETSCHEMA('VCode').workflow('verify', null, vcodeoptions, function(err, result) {
		if (err || !result) {
			self.jsonp(callbackName, {'code':'1001','message':'验证码验证错误'});
			return;
		} else {
			if (result && result.type === 1) {
				GETSCHEMA('User').workflow('create', null, options, function(err, data) {
					// Error
					if (err) {
						if (data) {
							self.jsonp(callbackName, data);
							return;
						} else {
							self.jsonp(callbackName, {'code':'1001','message':'注册失败'});
							return;
						}
					} else {
						// Return user data
						var user = {};
						user.userid 	= data.id;
						user.nickname	= data.nickname;
						user.loginName	= data.account;
						user.phone		= data.phone || data.account;
						user.sex 		= data.sex;
						user.potho 		= data.photo;
						user.userType 	= data.type;

						// Set cookie
						self.res.cookie(F.config.usercookie, F.encrypt({ userid: user.userid, ip: self.req.ip }, 'user'), new Date().add('5 minutes'));

						// Return results
						self.jsonp(callbackName, {'code':'1000','message':'success','datas':user});
					}
				}, true);
			} else {
				self.jsonp(callbackName, {'code':'1001','message':result.data});
				return;
			}
		}
	}, true);
}

// ==========================================================================
// USER
// ==========================================================================

// Reset password
//http://127.0.0.1:3000/app/user/resetpwd?callback=jQuery18208050271789543331_1442214882949&methodname=app%2Fuser%2Fresetpwd&account=18612341111&newPwd=12345678&smsCode=123456&_=1442214928220
function process_resetpwd() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	var smsCode = '123456';
	var phoneReg = RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');

	//if (!self.query.account || !phoneReg.test(self.query.account.toString())) {
	if (!self.query.account || !tools.isPhone(self.query.account.toString())) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入正确的11位手机号'});
		return;
	}
	if (!self.query.smsCode) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入验证码'});
		return;
	}
	if (!self.query.newPwd || self.query.newPwd.length < 6) {
		self.jsonp(callbackName, {'code':'1001','message':'请输入至少6位新密码'});
		return;
	}
	options.account = self.query.account;
	options.smsCode = self.query.smsCode;
	options.password = self.query.newPwd;
	options.ip = self.req.ip;

	vcodeoptions = {'target':self.query.account.toString(),'code_type':'resetpwd','code':self.query.smsCode};
	GETSCHEMA('VCode').workflow('verify', null, vcodeoptions, function(err, result) {
		if (err || !result) {
			self.jsonp(callbackName, {'code':'1001','message':'验证码验证错误'});
			return;
		} else {
			if (result && result.type === 1) {
				GETSCHEMA('User').workflow('update', null, options, function(err, data) {
					// Error
					if (err) {
						if (data) {
							self.jsonp(callbackName, data);
							return;
						} else {
							self.jsonp(callbackName, {'code':'1001','message':'密码修改失败'});
							return;
						}
					} else {
						// Return results
						self.jsonp(callbackName, {'code':'1000','message':'success'});
					}
				}, true);
			} else {
				self.jsonp(callbackName, {'code':'1001','message':result.data});
				return;
			}
		}
	}, true);
}

// Get user
//http://127.0.0.1:3000/app/user/get?callback=angular.callbacks._1&id=a7fcac6f4d&methodname=app%2Fuser%2Fget
function json_user_get() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	
	if (self.query.id)
		options.userid = self.query.id;
	options.ip = self.req.ip;

	GETSCHEMA('User').get(options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'未查询到用户'});
				return;
			}
		} else {
			// Return user data
			var user = {};
			user.userid 			= data.id;
			user.nickname			= data.nickname;
			user.loginName			= data.account;
			user.phone				= data.phone || data.account;
			user.sex 				= data.sex;
			user.potho 				= data.photo;
			user.userType 			= data.type;
			user.pointLaterTrade	= data.score;

			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':user});
		}
	});
}

// Get user score
//http://127.0.0.1:3000/app/point/findPointList?callback=angular.callbacks._0&locationUserId=a7fcac6f4d&methodname=app%2Fpoint%2FfindPointList&page=1&rows=10&userId=a7fcac6f4d
function json_userscore_get(){
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	
	if (self.query.userId)
		options.userid = self.query.userId;
	options.ip = self.req.ip;

	GETSCHEMA('User').get(options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'未查询到用户'});
				return;
			}
		} else {
			// Return data
			var score = data.score || 0;
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':{"total":0,"userId":data.id,"pointLaterTrade":score || 0,"rows":[]}});
		}
	});
}

// ==========================================================================
// User Address
// ==========================================================================

// Query useraddress list
//http://127.0.0.1:3000/app/user/getUserAddressList?callback=angular.callbacks._2&locationUserId=290583a6fd3140a3a99bf155e53d890e&methodname=app%2Fuser%2FgetUserAddressList&userId=77577d9e8c
function json_useraddresslist_query() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	
	if (self.query.userId)
		options.userid = self.query.userId;
	options.ip = self.req.ip;


	GETSCHEMA('Useraddress').query(options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'未查询到收货地址'});
				return;
			}
		} else {
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"areaName":item.provincename,
						  "areaId":item.provinceid,
						  "cityName":item.cityname,
						  "cityId":item.cityid,
						  "countyName":item.countyname,
						  "countyId":item.countyid,
						  "address":item.address,
						  "receiptPhone":item.receiptphone,
						  "receiptPeople":item.receiptpeople,
						  "userId":item.userid,
						  "type":item.type,
						  "addressId":item.id
						};
			}
			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
		}
	});

}

// Create useraddress
//http://127.0.0.1:3000/app/user/saveUserAddress?callback=angular.callbacks._7&address=%E5%BC%80%E5%B0%81%E5%B8%82%E5%BC%80%E5%B0%81%E5%8E%BF%E5%8D%97%E5%A4%A7%E8%A1%971%E5%8F%B7&areaId=0b150a29a8684c359759dce63e7b59c2&methodname=app%2Fuser%2FsaveUserAddress&receiptPeople=%E5%91%A8&receiptPhone=18612649699&type=1&userId=77577d9e8c
function json_useraddress_create(){
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	var phoneReg = RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');
	
	if (self.query.userId)
		options.userid = self.query.userId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的userId参数'});
		return;
	}
	if (self.query.address)
		options.address = self.query.address;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的address参数'});
		return;
	}
	if (self.query.areaId)
		options.provinceid = self.query.areaId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的areaId参数'});
		return;
	}
	if (self.query.cityId)
		options.cityid = self.query.cityId;
	if (self.query.countyId)
		options.countyid = self.query.countyId;
	if (self.query.receiptPhone){
		//if (!phoneReg.test(self.query.receiptPhone.toString())) {
		if (!tools.isPhone(self.query.receiptPhone.toString())) {
			self.jsonp(callbackName, {'code':'1001','message':'请输入正确的11位手机号'});
			return;
		}
		options.receiptphone = self.query.receiptPhone;
	}
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的receiptPhone参数'});
		return;
	}
	if (self.query.receiptPeople)
		options.receiptpeople = self.query.receiptPeople;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的receiptPeople参数'});
		return;
	}
	if (self.query.type && U.parseInt(self.query.type) === 1)
		options.type = 1;
	else
		options.type = 2;

	GETSCHEMA('Useraddress').workflow('create', null, options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'保存收货地址失败'});
				return;
			}
		} else {
			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success'});
			if (U.parseInt(self.query.type) === 1) {
				var newaddId = data.id;
				var Qoptions = {'userid':self.query.userId,'type':1};
				
				GETSCHEMA('Useraddress').query(Qoptions, function(err, data) {
					var items = data.items;
					var count = data.count;
					for (var i = 0; i < count; i++) {
						var item = items[i];
						var updateitem = {'userid':item.userid,'type':2,'id':item.id};
						if (newaddId !== item.id) {
							GETSCHEMA('Useraddress').workflow('update', null, updateitem, function(err, data) {
								if (err) {
									var printerror = ['重置用户',item.userid.toString(),'默认收货地址出错'];
									console.log(printerror.join(''));
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
// http://127.0.0.1:3000/app/user/updateUserAddress?callback=angular.callbacks._7&address=%E5%BC%80%E5%B0%81%E5%B8%82%E5%BC%80%E5%B0%81%E5%8E%BF%E5%8D%97%E5%A4%A7%E8%A1%971%E5%8F%B7&areaId=0b150a29a8684c359759dce63e7b59c2&methodname=app%2Fuser%2FsaveUserAddress&receiptPeople=%E5%91%A8&receiptPhone=18612649999&type=1&userId=77577d9e8c&addressId=e8c9c41ec8
function json_useraddress_update() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	var phoneReg = RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');
	
	if (self.query.userId)
		options.userid = self.query.userId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的userId参数'});
		return;
	}
	if (self.query.addressId)
		options.id = self.query.addressId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的addressId参数'});
		return;
	}
	if (self.query.address)
		options.address = self.query.address;
	if (self.query.areaId)
		options.provinceid = self.query.areaId;
	if (self.query.cityId)
		options.cityid = self.query.cityId;
	if (self.query.countyId)
		options.countyid = self.query.countyId;
	if (self.query.receiptPhone){
		//if (!phoneReg.test(self.query.receiptPhone.toString())) {
		if (!tools.isPhone(self.query.receiptPhone.toString())) {
			self.jsonp(callbackName, {'code':'1001','message':'请输入正确的11位手机号'});
			return;
		}
		options.receiptphone = self.query.receiptPhone;
	}
	if (self.query.receiptPeople)
		options.receiptpeople = self.query.receiptPeople;
	if (self.query.type) {
		if (U.parseInt(self.query.type) === 1)
			options.type = 1;
		else
			options.type = 2;
	}

	GETSCHEMA('Useraddress').workflow('update', null, options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'更新收货地址失败'});
				return;
			}
		} else {
			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success'});
			if (U.parseInt(self.query.type) === 1) {
				var newaddId = options.id;
				var Qoptions = {'userid':self.query.userId,'type':1};
				GETSCHEMA('Useraddress').query(Qoptions, function(err, data) {
					var items = data.items;
					var count = data.count;
					for (var i = 0; i < count; i++) {
						var item = items[i];
						if (newaddId !== item.id) {
							var updateitem = {'userid':item.userid,'type':2,'id':item.id};
							GETSCHEMA('Useraddress').workflow('update', null, updateitem, function(err, data) {
								if (err) {
									var printerror = ['重置用户',item.userid.toString(),'默认收货地址出错'];
									console.log(printerror.join(''));
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
//http://127.0.0.1:3000/app/user/deleteUserAddress?callback=angular.callbacks._2&locationUserId=290583a6fd3140a3a99bf155e53d890e&methodname=app%2Fuser%2FgetUserAddressList&&userId=77577d9e8c&addressId=280b77d168
function json_useraddress_remove() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var options = {};
	
	if (self.query.userId)
		options.userid = self.query.userId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的userId参数'});
		return;
	}
	if (self.query.addressId)
		options.id = self.query.addressId;
	else {
		self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的addressId参数'});
		return;
	}
	GETSCHEMA('Useraddress').remove(options, function(err, data) {
		// Error
		if (err) {
			if (data) {
				self.jsonp(callbackName, data);
				return;
			} else {
				self.jsonp(callbackName, {'code':'1001','message':'删除收货地址失败'});
				return;
			}
		} else {
			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success'});
		}
	});
}