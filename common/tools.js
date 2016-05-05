/**
 * Created by zhouxin on 2015/09/21.
 */

var http = require('http');
var https = require('https');
var querystring = require('querystring');
var JWT = require('jsonwebtoken');
var pinyin = require("pinyin");

var regexpPhone = new RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');
var regexpPrice = new RegExp('^[0-9]*(\.[0-9]{1,2})?$');
var regexIdentityNo = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
var regexpXXNRHost = new RegExp('(.*\.|^)xinxinnongren\.com.*');
var config = require('../config');
var Global = require('../global.js');
var moment = require('moment-timezone');

/*
    Phone in china validation
    @str {String}
    return {Boolean}
*/
exports.isPhone = function(str) {
    if (!str)
        return false;

    return regexpPhone.test(str.toString());
};

/*
    Price > 0
    @str {String}
    return {Boolean}
*/
exports.isPrice = function(str) {
    if (!str)
        return false;

    return regexpPrice.test(str.toString());
};

exports.parseInt = function(obj, def){
    if (obj === undefined || obj === null)
        return def || 0;

    var type = typeof(obj);

    if (type === 'number')
        return obj;

    var str = type !== 'string' ? obj.toString() : obj;
    return str.parseInt(def, 10);
};

exports.generateAuthCode = function (length) {
    var self = this;
    length = self.parseInt(length, 6);
    var authCode = '';
    for (var i = 0; i < length; i++) {
        authCode += Math.floor(Math.random() * 10);
    }

    return authCode;
};

function sendPhoneMessage(phonenumber, content) {

    var options = config.phone_message_options;
    var httpOptions = options.http_request_options;

    httpOptions.path = options['url'] + querystring.stringify({
            action: 'send',
            userid: options['userid'],
            account: options['account'],
            password: options['password'],
            mobile: phonenumber,
            content: content
        });

    var req = http.request(httpOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if ((chunk.indexOf('<returnstatus>Success</returnstatus>', 0) == -1) || (chunk.indexOf('<message>ok</message>', 0) == -1)) {
                console.error('sendPhoneMessage return err:', chunk);
            }
        });
    });

    req.on('error', function (e) {
        console.error('problem with request:', e.message);
    });

    // req.write(postData); we don't have body.

    req.end();
};

exports.sendMessage = function(phonenumber, message){
    var content = '验证码：' + message;
    console.log(phonenumber + content);
    sendPhoneMessage(phonenumber, content);
};

exports.sendActivePhoneMessage = function (phonenumber, code) {
    // If anyone change the content below, please DO phone the 和信通 to add it into whitelist, otherwise, our short message will be blocked.
    //var content = '【新新农人】验证码：' + code + '，确认后请在10分钟内填写，切勿泄露给他人，如非本人操作，建议及时与客服人员联系'
    var content = '验证码：' + code + '，确认后请在10分钟内填写，切勿泄露给他人，如非本人操作，建议及时与客服人员联系 - 新新农人';
    console.log(phonenumber + content);
    sendPhoneMessage(phonenumber, content);
};


function guessMobileCode(mobile_code, target) {
    // only supports China now.
    var mobile_codes = ['86'];

    if (mobile_code) {
        for (var i = 0; i < mobile_codes.length; i++) {
            if (mobile_code == mobile_codes[i]) {
                // insert the mobile code.
                return mobile_code;
            }
        }

        return false;
    } else {
        if (validator.isNumeric(target)) {
            if (target.length == 11) {
                return '86';
            }

            return false;
        } else {
            return false;
        }
    }
}

exports.guessMobileCode = guessMobileCode;

exports.guessTarget = function (mobile_code, target) {
    var mobile_code = guessMobileCode(mobile_code, target);
    if (mobile_code && mobile_code != '86') {
        return mobile_code + target;
    }

    return target;
};

/* moved into total js, so we don't need to require tools
exports.common_response = function(data){
    var self = this;
    var callbackName = self.data['callback'];
    callbackName ? self.jsonp(callbackName, data) : self.json(data);
};
*/

exports.getStringLen = function(val, max) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
       var length = val.charCodeAt(i);
       if(length>=0&&length<=128) {
            len += 1;
        } else {
            len += 2;
        }
        if (max && len > parseInt(max))
            return true;
    }
    if (max)
        return false;
    else
        return len;
};

// Json Web Token authentication part.

/**
 * this function is used to generate the jwt object for a logged in user
 * should be called after the user login/regist
 * @param userId: user.id field
 * @param appLoginId:
 * @param webLoginId:
 * @return token: issued token
 */
exports.generate_token = function(userId, appLoginId, webLoginId){
    var token = JWT.sign(
        {                                               //payload
            userId:userId,
            appLoginId:appLoginId,
            webLoginId:webLoginId
        },
        Global.key.exportKey('pkcs8-private-pem'),    //private key
        {                                               //options
            algorithm: config.user_token_algorithm,
            subject:userId,
            expiresIn: config.user_token_expires_in,
            issuer: config.user_token_issuer
        }
    );
    return token;
};

exports.decrypt_password = function(encryptedPassword){
    try {
        return Global.key.decrypt(encryptedPassword, 'utf8');
    }catch(e){
        console.log(e);
        return null;
    }
};


exports.verify_token = function(token){
    var payload = JWT.verify(
        token,
        Global.key.exportKey('pkcs8-public-pem'),
        {
            algorithm: config.user_token_algorithm,
            issuer: config.user_token_issuer
        }
    );

    return payload;
};

exports.isXXNRAgent = function(verifiedTypes){
    return verifiedTypes && verifiedTypes.indexOf(config.XXNRAgentId) != -1;
};

exports.isRSC = function(verifiedTypes){
    return verifiedTypes && verifiedTypes.indexOf(config.RSCId) != -1;
};

exports.isValidIdentityNo = function(identityNo){
    return regexIdentityNo.test(identityNo);
};

exports.regexIdentityNo = regexIdentityNo;

exports.isEmptyObject = function isEmptyObject(obj) {
    return !Object.keys(obj).length;
};

// get xxnr host
exports.getXXNRHost = function(url){
    if (!url)
        return 'www.xinxinnongren.com';

    if (regexpXXNRHost.test(url.toString())) {
        return 'www.xinxinnongren.com';
    } else {
        return url;
    }
};

exports.isOfflinePayType = function(type){
    const offlinePayType = [3, 4];
    return offlinePayType.indexOf(type) != -1;
};

exports.isArray = function(obj) {
    return obj instanceof Array;
};

/**
 * http request function
 * @param  {object}   httpOptions http request options
 * @param  {Function} callback    callback function
 * @return {null}     only callback
 */
exports.httpRequest = function(options, callback) {
    if (!options) {
        callback('options is null');
        return;
    }
    if (!options.httpOptions) {
        callback('httpOptions is null');
        return;
    }

    var req = http.request(options.httpOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (res.statusCode == 200) {
                callback(null, chunk);
            } else {
                callback(res.statusCode, chunk);
            }
        });
    });

    if (options.postData) {
        req.write(options.postData);
    }

    req.on('error', function (e) {
        console.error('tools httpRequest error:', e);
        callback(e);
    });

    

    req.end();
};

/**
 * get string's Pinyin
 * @param  {object}   options  input string
 * @return {object}   the yinpin result {'error':error info, 'strPinyin':string pinyin result, 'initial':the initial of pinyin, 'initialType':the initialType of pinyin 1(a-z-A-Z) 2(others)}
 */
exports.stringPinyin = function(options) {
    var strPinyin = '#';
    var initial = '#';
    var initialType = 2;
    if (options.str) {
        try {
            var pinyinList = pinyin(options.str, {style: pinyin.STYLE_NORMAL});
            strPinyin = pinyinList.join("").toLowerCase();
            var char = strPinyin[0];
            var regs=/^[A-Z-a-z]$/;
            if(regs.test(char)) {
                initial = char.toUpperCase();
                initialType = 1;
            } else {
                strPinyin = initial + strPinyin;
                initialType = 2;
            }
            return {'strPinyin':strPinyin, 'initial':initial, 'initialType':initialType};
        } catch (e) {
            console.error('tools stringPinyin err:', e, options.str);
            return {'error':e, 'strPinyin':strPinyin, 'initial':initial, 'initialType':initialType};
        }
    } else {
        return {'error':'no string', 'strPinyin':strPinyin, 'initial':initial, 'initialType':initialType};
    }
};

exports.getWeekStartEndTime = function(weekMinus){
    var currentTime = new Date();
    var dayOfWeek = currentTime.getDay();
    if(dayOfWeek == 0){
        // getDay will return 0 if it is Sunday
        dayOfWeek = 7;
    }

    var startTime = new Date(currentTime.add('d', weekMinus*7-dayOfWeek+1).format('yyyy-MM-dd')).add('h', -F.config.currentTimeZoneDiff);
    var endTime = new Date(currentTime.add('d', (weekMinus+1)*7-dayOfWeek+1).format('yyyy-MM-dd')).add('h', -F.config.currentTimeZoneDiff);
    if(weekMinus == 0){
        endTime = new Date(F.config.serviceStartTime).add('h', -F.config.currentTimeZoneDiff);
    }

    return {startTime: startTime, endTime: endTime};
};

exports.getWeekStartTimeByDate = function(date){
     var dayOfWeek = date.getDay();
    if(dayOfWeek == 0){
        // getDay will return 0 if it is Sunday
        dayOfWeek = 7;
    }

    return new Date(date.add('d', 1-dayOfWeek).format('yyyy-MM-dd')).add('h', -F.config.currentTimeZoneDiff);
};