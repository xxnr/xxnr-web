/**
 * Created by zhouxin on 2015/09/21.
 */

var http = require('http');
var https = require('https');
var querystring = require('querystring');

var regexpPhone = new RegExp('^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$');

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
}

exports.sendPhoneMessage = sendPhoneMessage;

exports.sendActivePhoneMessage = function (phonenumber, code) {
    // If anyone change the content below, please DO phone the 和信通 to add it into whitelist, otherwise, our short message will be blocked.
    var content = '【新新农人】验证码：' + code + '，确认后请在10分钟内填写，切勿泄露给他人，如非本人操作，建议及时与客服人员联系'
    console.log(content);
    //sendPhoneMessage(phonenumber, content);
}


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