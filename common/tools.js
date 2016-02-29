/**
 * Created by zhouxin on 2015/09/21.
 */

var http = require('http');
var https = require('https');
var querystring = require('querystring');
var JWT = require('jsonwebtoken');

var regexpPhone = new RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');
var regexpPrice = new RegExp('^[0-9]*(\.[0-9]{1,2})?$');
var regexIdentityNo = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;

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

exports.generateAuthCode = function () {
    var authCode = '';
    for (var i = 0; i < 6; i++) {
        authCode += Math.floor(Math.random() * 10);
    }

    return authCode;
};

function sendPhoneMessage(phonenumber, content) {

    var options = (F.config.phone_message_options).parseJSON();
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
                console.log(chunk);
            }
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
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
        F.global.key.exportKey('pkcs8-private-pem'),    //private key
        {                                               //options
            algorithm: F.config.user_token_algorithm,
            subject:userId,
            expiresIn: F.config.user_token_expires_in,
            issuer: F.config.user_token_issuer
        }
    );
    return token;
};

exports.decrypt_password = function(encryptedPassword){
    try {
        return F.global.key.decrypt(encryptedPassword, 'utf8');
    }catch(e){
        console.log(e);
        return null;
    }
};


exports.verify_token = function(token){
    var payload = JWT.verify(
        token,
        F.global.key.exportKey('pkcs8-public-pem'),
        {
            algorithm: F.config.user_token_algorithm,
            issuer: F.config.user_token_issuer
        }
    );

    return payload;
};

exports.isXXNRAgent = function(verifiedTypes){
    const XXNRAgentId = '6';
    return verifiedTypes && verifiedTypes.indexOf(XXNRAgentId) != -1;
};

exports.isRSC = function(verifiedTypes){
    const RSCId = '5';
    return verifiedTypes && verifiedTypes.indexOf(RSCId) != -1;
};

exports.isValidIdentityNo = function(identityNo){
    return regexIdentityNo.test(identityNo);
};

exports.regexIdentityNo = regexIdentityNo;

exports.isEmptyObject = function isEmptyObject(obj) {
    return !Object.keys(obj).length;
};