/**
 * Created by zhouxin on 2016/03/21.
 */
var querystring = require('querystring');
var crypto = require('crypto');
var tools = require('../common/tools');
var umengConfig = require('../configuration/umeng_config');
var moment = require('moment-timezone');

// Service
var Umeng = function(){};

/**
 * sign umeng message
 * @param  {object} params          message info
 * @param  {string} appMasterSecret secret key
 * @return {string} sign info
 */
Umeng.prototype.sign = function(params, appMasterSecret) {
	// sign
    var sign_info = umengConfig.sendMethod + 'http://' + umengConfig.host + umengConfig.sendPath + JSON.stringify(params) + appMasterSecret;
	var md5 = crypto.createHash("md5");
	md5.update(sign_info, 'utf8');
	var sign = md5.digest('hex');
	return sign;
};

/**
 * umeng send function
 * @param  {object}   options		umeng send key/value options
 * @param  {Function} callback 		callback function
 * @return {null}     only callback
 */
Umeng.prototype.umengSend = function(params, appMasterSecret, callback) {
	var self = this;
	if (!params) {
		console.error('Umeng umengSend params is null');
		callback('params is null');
		return;
	}
	if (!appMasterSecret) {
		console.error('Umeng umengSend appMasterSecret is null');
		callback('appMasterSecret is null');
		return;
	}
	var sign = self.sign(params, appMasterSecret);
	var httpOptions = {method: umengConfig.sendMethod, host: umengConfig.host, path: umengConfig.sendPath+'?sign='+sign};
	tools.httpRequest({httpOptions: httpOptions, postData: JSON.stringify(params)}, function(err, result) {
		if (err) {
			console.error('Umeng umengSend httpRequest err:', err);
			callback(err, result);
			return;
		}
		console.log(result);
	});
};

/**
 * send Android Customized cast
 * @param  {number}   type     message type
 * @param  {string}   alias    Customized cast alias
 * @param  {object}   options  umeng send key/value options
 * @param  {Function} callback callback function
 * @return {null}              only callback
 */
Umeng.prototype.sendAndroidCustomizedcast = function(type, alias, aliasType, options, callback) {
	var self = this;
	if (!type || !umengConfig.body[type]) {
		callback('need message type');
		return;
	}
	if (!aliasType || !umengConfig.body[type][aliasType]) {
		callback('need message aliasType');
		return;
	}
	if (!alias) {
		callback('need alias');
		return;
	}
	var customizedcast = {
		'appkey': umengConfig.androidAppKey,
		'timestamp': Date.parse(new Date()),
		'type': "customizedcast",
		'description': "aliasnotification-Android"
	};
	customizedcast.alias = alias;
	customizedcast.alias_type = umengConfig.alias_type;
	// 必填 消息内容(Android最大为1840B), 包含参数说明如下(JSON格式):
	customizedcast.payload = {
    	display_type: "notification",  // 必填 消息类型，值可以为: notification-通知，message-消息
    	// 必填 消息体。display_type=message时,body的内容只需填写custom字段。display_type=notification时, body包含如下参数:
    	body: {
    		// 通知用户订单状态变化，打开订单详情，自提或付款
			// 点击"通知"的后续行为，默认为打开app。
			after_open: umengConfig.body[type][aliasType].after_open, // 必填 值可以为:"go_app": 打开应用 "go_url": 跳转到URL "go_activity": 打开特定的activity "go_custom": 用户自定义内容。
			activity: umengConfig.body[type][aliasType].activity, // 可选 当"after_open"为"go_activity"时，必填。通知栏点击后打开的Activity
			ticker: umengConfig.body[type][aliasType].ticker, // 必填 通知栏提示文字
	    	title: umengConfig.body[type][aliasType].title, // 必填 通知标题
	    	text:  umengConfig.body[type][aliasType].text // 必填 通知文字描述
    	}
    };
    
    // 可选 用户自定义key-value。只对"通知"(display_type=notification)生效。可以配合通知到达后,打开App,打开URL,打开Activity使用。
    customizedcast.payload.extra = {};
    if (options.orderId) {
    	customizedcast.payload.extra.orderId = options.orderId;
    }

    // // 自定义通知图标:
    // "icon":"xx",       // 可选 状态栏图标ID, R.drawable.[smallIcon],如果没有, 默认使用应用图标。图片要求为24*24dp的图标,或24*24px放在drawable-mdpi下。注意四周各留1个dp的空白像素
    // "largeIcon":"xx",  // 可选 通知栏拉开后左侧图标ID, R.drawable.[largeIcon].图片要求为64*64dp的图标,可设计一张64*64px放在drawable-mdpi下,注意图片四周留空，不至于显示太拥挤
    // "img": "xx",       // 可选 通知栏大图标的URL链接。该字段的优先级大于largeIcon。该字段要求以http或者https开头。
    // // 自定义通知声音:
    // "sound": "xx",     // 可选 通知声音，R.raw.[sound]. 如果该字段为空，采用SDK默认的声音, 即res/raw/下的umeng_push_notification_default_sound声音文件如果SDK默认声音文件不存在，则使用系统默认的Notification提示音。
    // // 自定义通知样式:
    // "builder_id": xx   // 可选 默认为0，用于标识该通知采用的样式。使用该参数时, 开发者必须在SDK里面实现自定义通知栏样式。
    // // 通知到达设备后的提醒方式
    // "play_vibrate":"true/false", // 可选 收到通知是否震动,默认为"true".注意，"true/false"为字符串
    // "play_lights":"true/false",  // 可选 收到通知是否闪灯,默认为"true"
    // "play_sound":"true/false",   // 可选 收到通知是否发出声音,默认为"true"
    
    // send 
    self.umengSend(customizedcast, umengConfig.androidAppMasterSecret, function(err, result) {
    	if (err) {
			console.error('Umeng sendAndroidCustomizedcast umengSend err:', err);
			callback(err, result);
			return;
		}
		console.log(result);
    });
};

/**
 * send IOS Customized cast
 * @param  {number}   type     message type
 * @param  {string}   alias    Customized cast alias
 * @param  {object}   options  umeng send key/value options
 * @param  {Function} callback callback function
 * @return {null}              only callback
 */
Umeng.prototype.sendIOSCustomizedcast = function(type, alias, aliasType, options, callback) {
	var self = this;
	if (!type || !umengConfig.body[type]) {
		callback('need message type');
		return;
	}
	if (!aliasType || !umengConfig.body[type][aliasType]) {
		callback('need message aliasType');
		return;
	}
	if (!alias) {
		callback('need alias');
		return;
	}
	var customizedcast = {
		'appkey': umengConfig.iosAppKey,
		'timestamp': Date.parse(new Date()),
		'type': "customizedcast",
		'description': "aliasnotification-iOS"
	};
	customizedcast.alias = alias;
	customizedcast.alias_type = umengConfig.alias_type;
	// 必填 消息内容(iOS最大为2012B), 包含参数说明如下(JSON格式):
	customizedcast.payload = {
		// 必填 严格按照APNs定义来填写
		aps: {
	        alert: umengConfig.body[type][aliasType].text          // 必填
	    }
    };
    // "badge": xx,           // 可选        
    // "sound": "xx",         // 可选         
    // "content-available":xx // 可选       
    // "category": "xx",      // 可选, 注意: ios8才支持该字段。
    
    // 可选 用户自定义内容, "d","p"为友盟保留字段，key不可以是"d","p"
    if (options.orderId) {
    	customizedcast.payload.orderId = options.orderId;
    }

    // send 
    self.umengSend(customizedcast, umengConfig.iosAppMasterSecret, function(err, result) {
    	if (err) {
			console.error('Umeng sendIOSCustomizedcast umengSend err:', err);
			callback(err, result);
			return;
		}
		console.log(result);
    });
};

/**
 * send Customized cast
 * @param  {number}   type     message type
 * @param  {string}   alias    Customized cast alias
 * @param  {object}   options  umeng send key/value options {orderId}
 * @param  {Function} callback callback function
 * @return {null}              only callback
 */
Umeng.prototype.sendCustomizedcast = function(type, alias, aliasType, options, times, callback) {
	var self = this;
	if (!times) {
		times = 1;
	}
	// send Android Customized cast
    self.sendAndroidCustomizedcast(type, alias, aliasType, options, function(err, result) {
    	if (err) {
			console.error('Umeng sendCustomizedcast sendAndroidCustomizedcast err:', err, result ? result : '');
			if (err == 500 && result) {
				var data = JSON.parse(result);
				// when umeng result error_code in retryCodes, retry send..
				if (data["data"]) {
					for (var i=0; i<umengConfig.retryCodes.length; i++) {
						var code = umengConfig.retryCodes[i];
						if (data["data"]["error_code"]==code) {
							if (times && times < 2) {
								setTimeout(function() {
									self.sendCustomizedcast(type, alias, aliasType, options, times+1)
									}, 10000);
							} else {
								console.error('Umeng sendCustomizedcast sendAndroidCustomizedcast send the max times...');
							}
							break;
						}
					}
				}
			}
		} else {
			console.log('Umeng sendCustomizedcast sendAndroidCustomizedcast result:', result);
		}
    });
};

module.exports = new Umeng();