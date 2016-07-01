var tools = require('../common/tools');
var utils = require('../common/utils');
var DrawText = require('../modules/DrawText');
var services = require('../services');
var UserService = services.user;
var vCodeService = services.vCode;
var vcode_config = require('../configuration/vcode_config');
var path = require('path');
var TEMPORARY_KEY_REGEX = /\//g;
var RESPONSE_HEADER_CACHECONTROL = 'Cache-Control';
var RESPONSE_HEADER_CONTENTTYPE = 'Content-Type';
var RESPONSE_HEADER_CONTENTLENGTH = 'Content-Length';
var CONTENTTYPE_TEXTPLAIN = 'text/plain';
var CONTENTTYPE_TEXTHTML = 'text/html';
var REQUEST_COMPRESS_CONTENTTYPE = { 'text/plain': true, 'text/javascript': true, 'text/css': true, 'application/x-javascript': true, 'application/json': true, 'text/xml': true, 'image/svg+xml': true, 'text/x-markdown': true, 'text/html': true };


exports.install = function() {
	// SMS
	//F.route('/api/v2.0/sms/',					generate_sms, ['get', 'post']);

	// v1.0
	//fix api// F.route('/app/sms/',						generate_sms, ['get', 'post']);
};

// ==========================================================================
// graph vcode image
// ==========================================================================
var temporary = {
    path: {},
    processing : {}
};
var img_extension = 'png';

function createTemporaryKey(req) {
    return req.path.replace(TEMPORARY_KEY_REGEX, '-').substring(1);
}

function responseImg(res, graphvCode, extension) {
    if (res && graphvCode) {
        // return image for graphvCode.code
        DrawText(graphvCode.code, function(buf) {
            if (!buf) {
                console.error('B.vcode graph_vcode_image getGraphvCode err:', err);
                // return 404
                next();
                return res.sendStatus(404);
            }
            res.set('Pragma', 'no-cache');
            res.set(RESPONSE_HEADER_CACHECONTROL, 'no-cache, no-store, max-age=0, must-revalidate');
            res.set('Expires', new Date().add('Y', -10));
            res.set(RESPONSE_HEADER_CONTENTTYPE, utils.getContentType(extension?extension:img_extension));
            res.end(buf);
        });
    }
    return;
}

exports.graph_vcode_image = function(req, res, next) {
    var code_type = req.params.type;
    var filename = req.params.filename;
    if (filename.indexOf('.') !== -1) {
        filename = filename.split('.')[0];
    }
    var target_type = 'phone';
    var options = {};
    options.target = decrypt_filename(filename);
    options.code_type = code_type;
    options.target_type = target_type;
    options.ip = req.ip;

    vCodeService.getGraphvCode(options, function(err, graphvCode) {
        if (err || !graphvCode) {
            if (err)
                console.error('B.vcode graph_vcode_image getGraphvCode err:', err);
            // return 404
            next();
            return res.sendStatus(404);
        }
        // return image for graphvCode.code
        var key = createTemporaryKey(req);
        var extension = req.extension;
        if (!extension) {
            if (key)
                extension = path.extname(key);
        }
        responseImg(res, graphvCode, extension);
        return;
    });
}

// refresh graph vcode
exports.generate_refresh_graph_vcode = function(req, res, next) {
    var requestType = '';
    var code_type, target;
    var target_type = 'phone';
    var mobile_code = '86';
    if (req.data.bizcode)
        requestType = req.data.bizcode;
    var callback = function (err, graphvCode) {
        if (err || !graphvCode) {
            if (err)
                console.error('B.vcode generate_refresh_graph_vcode updateOrCreateGraphvCode err:', err);
            // res.respond({
            //     code: 1001,
            //     message: '获取图形验证码出错，请刷新'
            // });
            // return;
            next();
            return res.sendStatus(404);
        }
        // var host = req.hostname;
        // var prevurl = 'http://' + host;
        // var captchaUrl = generate_captcha_url(graphvCode);
        // res.respond({
        //     code: 1000,
        //     captcha: captchaUrl ? prevurl + captchaUrl : ''
        // });
        responseImg(res, graphvCode, img_extension);
        return;
    };
    if (requestType === 'resetpwd') {
        if (!req.data.tel || !tools.isPhone(req.data.tel)) {
            // res.respond({
            //     code: 1001,
            //     message: '请输入正确的手机号'
            // });
            // return;
            next();
            return res.sendStatus(404);
        } else {
            code_type = 'resetpwd';
            target = req.data.tel;
            var user = {'account': target};

            UserService.get(user, function (err, data) {
                if (!data || err) {
                    // res.respond({
                    //     code: 1001,
                    //     message: '没有找到用户，请重新输入'
                    // });
                    // return;
                    next();
                    return res.sendStatus(404);
                } else {
                    var options = {target: target, code_type: code_type, ip: req.ip, target_type:target_type};
                    vCodeService.updateOrCreateGraphvCode(options, callback);
                }
            });
        }
    } else {
        if (requestType === 'register') {
            if (!req.data.tel || !tools.isPhone(req.data.tel)) {
                // res.respond({
                //     code: 1001,
                //     message: '请输入正确的手机号'
                // });
                // return;
                next();
                return res.sendStatus(404);
            } else {
                code_type = 'register';
                target = req.data.tel;
                var user = {'account': target};

                UserService.get(user, function (err, data) {
                    if (!data || err) {
                        var options = {target: target, code_type: code_type, ip: req.ip, target_type:target_type};
                        vCodeService.updateOrCreateGraphvCode(options, callback);
                    } else {
                        // res.respond({
                        //     code: 1001,
                        //     message: '该手机号已注册，请重新输入'
                        // });
                        // return;
                        next();
                        return res.sendStatus(404);
                    }
                });
            }
        } else {
            // res.respond({
            //     code: 1001,
            //     message: '请求参数错误，无效的bizcode参数'
            // });
            // return;
            next();
            return res.sendStatus(404);
        }
    }
}

// ==========================================================================
// validate vcode
// ==========================================================================

// new sms
exports.generate_validate_sms = function(req, res, next) {
    var self = this;
    // 判断今天发短信条数是否超过阈值
    vCodeService.getDailySmsNumber(null, function(err, dailySmsNumber) {
        if (err) {
            console.error('B.vcode generate_validate_sms getDailySmsNumber err:', err);
        }
        if (dailySmsNumber && vcode_config.daily_max_sms && dailySmsNumber.num > vcode_config.daily_max_sms) {
            graph_vcode(req, res);
        } else {
            // 发短信的ip throttle机制
            if (vcode_config.ipThrottle && req.ip) {
                vCodeService.getAndAddIpThrottle({ip: req.ip, type:'sms'}, function(err, ipThrottle) {
                    if (err) {
                        console.error('B.vcode generate_validate_sms getAndAddIpThrottle err:', err);
                        graph_vcode(req, res);
                    } else {
                        if (ipThrottle) {
                            graph_vcode(req, res);
                        } else {
                            generate_sms_vcode(req, res, next);
                        }
                    }
                });
            } else {
                graph_vcode(req, res);
            }
        }
    });
}

function graph_vcode(req, res) {
    var requestType = '';
    var code_type, target, authCode;
    var target_type = 'phone';
    var mobile_code = '86';
    var ip = req.ip;
    if (req.data.bizcode)
        requestType = req.data.bizcode;
    if (req.data.authCode)
        authCode = req.data.authCode;
    var host = req.hostname;
    var prevurl = 'http://' + host;
    var callback = function (err, graphvCode) {
        if (err) {
            if (err.type == 'graphvCode' && graphvCode) {
                var captchaUrl = generate_captcha_url(graphvCode);;
                res.respond({
                    code: 1000,
                    message: err.message?err.message:'图形验证码错误',
                    captcha: captchaUrl ? prevurl + captchaUrl : ''
                });
                return;
            } else {
                res.respond({
                    code: 1001,
                    message: err.message?err.message:'获取验证码失败，请重试'
                });
                return;
            }
        } else {
            if (graphvCode) {
                var captchaUrl = generate_captcha_url(graphvCode);
                res.respond({
                    code: 1000,
                    captcha: captchaUrl ? prevurl + captchaUrl : ''
                });
                return;
            }
            res.respond({
                code: 1000,
                message: '成功获取短信，请注意查收'
            });
            return;
        }
    };
    if (requestType === 'resetpwd') {
        if (!req.data.tel || !tools.isPhone(req.data.tel)) {
            res.respond({
                code: 1001,
                message: '请输入正确的手机号'
            });
            return;
        } else {
            code_type = 'resetpwd';
            target = req.data.tel;
            var user = {'account': target};

            UserService.get(user, function (err, data) {
                if (!data || err) {
                    res.respond({
                        code: 1001,
                        message: '没有找到用户，请重新输入'
                    });
                    return;
                } else {
                    generate_graph_vcode(code_type, target, target_type, mobile_code, ip, authCode, callback);
                }
            });
        }
    } else {
        if (requestType === 'register') {
            //if (req.user) {
            //   res.respond({'code':'1001','message':'用户已登录，请先登出'});
            // }
            if (!req.data.tel || !tools.isPhone(req.data.tel)) {
                res.respond({
                    code: 1001,
                    message: '请输入正确的手机号'
                });
                return;
            } else {
                code_type = 'register';
                target = req.data.tel;
                var user = {'account': target};

                UserService.get(user, function (err, data) {
                    if (!data || err) {
                        generate_graph_vcode(code_type, target, target_type, mobile_code, ip, authCode, callback);
                    } else {
                        res.respond({
                            code: 1001,
                            message: '该手机号已注册，请重新输入'
                        });
                        return;
                    }
                });
            }
        } else {
            res.respond({
                code: 1001,
                message: '请求参数错误，无效的bizcode参数'
            });
            return;
        }
    }
};

// Generates graph vcode
function generate_graph_vcode(code_type, target, target_type, mobile_code, ip, authCode, callback) {
    var options = {};
    options.target = target;
    options.code_type = code_type;
    options.target_type = target_type;
    options.ip = ip;

    vCodeService.getGraphvCode(options, function(err, graphvCode){
        if (err) {
            console.error('B.vcode generate_graph_vcode getGraphvCode err:', err);
            return callback({type:'graphvCode', message: '获取图形验证码失败，请刷新'});
        }
        if (graphvCode) {
            if (authCode) {
                options.code = authCode;
                vCodeService.verifyGraphvCode(options, function(err, result) {
                    if (err) {
                        console.error('B.vcode generate_graph_vcode verifyGraphvCode err:', err);
                        return callback({type:'graphvCode', message: '图形验证码错误'});
                    }
                    if (result && result.type == 1) {
                        // send vcode message
                        generate_vcode(code_type, target, target_type, mobile_code, function (err, result) {
                            if (err) {
                                console.error('B.vcode generate_graph_vcode generate_vcode err:', err);
                                return callback({type:'vCode', message: '获取短信验证码失败，请重试'});
                            } else {
                                if (result && result.renew && result.renew === 2) {
                                    return callback({type:'vCode', message: '获取短信验证码太频繁，请稍后再试'});
                                }
                                return callback(null);
                            }
                        });
                    } else {
                        vCodeService.updateOrCreateGraphvCode(graphvCode, function(err, graphvCode) {
                            if (err) {
                                console.error('B.vcode generate_graph_vcode updateOrCreateGraphvCode err:', err);
                                return callback({type:'graphvCode', message: '图形验证码错误'});
                            }
                            return callback({type:'graphvCode', message: '图形验证码错误'}, graphvCode);
                        });
                    }
                });
            } else {
                vCodeService.updateOrCreateGraphvCode(graphvCode, function(err, graphvCode) {
                    if (err) {
                        console.error('B.vcode generate_graph_vcode updateOrCreateGraphvCode err:', err);
                        return callback({type:'graphvCode', message: '验证码更新失败'}, graphvCode);
                    }
                    return callback(null, graphvCode);
                });
            }
        } else {
            vCodeService.createGraphvCode(options, function(err, graphvCode){
                if (err) {
                    console.error('B.vcode generate_graph_vcode createGraphvCode err:', err);
                    return callback({type:'graphvCode', message: '获取图形验证码失败，请刷新'});
                }

                return callback(null, graphvCode);
            });
        }
    });
}

// ==========================================================================
// SMS
// ==========================================================================
function generate_sms_vcode(req, res, next) {
    var requestType = '';
    var code_type, target;
    var target_type = 'phone';
    var mobile_code = '86';
    if (req.data.bizcode)
        requestType = req.data.bizcode;

    if (requestType === 'resetpwd') {
        if (!req.data.tel || !tools.isPhone(req.data.tel)) {
            res.respond({'code': '1001', 'message': '请输入正确的手机号'});
            return;
        } else {
            code_type = 'resetpwd';
            target = req.data.tel;
            var user = {'account': target};

            UserService.get(user, function (err, data) {
                if (!data || err) {
                    res.respond({'code': '1001', 'message': '没有找到用户，请重新输入'});
                    return;
                } else {
                    generate_vcode(code_type, target, target_type, mobile_code, function (err, result) {
                        if (err) {
                            res.respond({'code': '1001', 'message': '生成vcode错误'});
                            return;
                        } else {
                            if (result && result.renew && result.renew === 2) {
                                res.respond({'code': '1001', 'message': '稍等片刻再获取'});
                                return;
                            }
                            res.respond({'code': '1000', 'message': 'success'});
                            return;
                        }
                    });
                }

            });
        }
    } else {
        if (requestType === 'register') {
            //if (req.user) {
            //   res.respond({'code':'1001','message':'用户已登录，请先登出'});
            // }
            if (!req.data.tel || !tools.isPhone(req.data.tel)) {
                res.respond({'code': '1001', 'message': '请输入正确的手机号'});
                return;
            } else {
                code_type = 'register';
                target = req.data.tel;
                var user = {'account': target};

                UserService.get(user, function (err, data) {
                    if (!data || err) {
                        generate_vcode(code_type, target, target_type, mobile_code, function (err, result) {
                            if (err) {
                                res.respond({'code': '1001', 'message': '生成vcode错误'});
                                return;
                            } else {
                                if (result && result.renew && result.renew === 2) {
                                    res.respond({'code': '1001', 'message': '稍等片刻再获取'});
                                    return;
                                }
                                res.respond({'code': '1000', 'message': 'success'});
                                return;
                            }
                        });
                    } else {
                        res.respond({'code': '1001', 'message': '该手机号已注册，请重新输入'});
                        return;
                    }
                });
            }
        } else {
            res.respond({'code': '1001', 'message': '请求参数错误，无效的bizcode参数'});
            return;
        }
    }
};
// Generates sms
exports.generate_sms = generate_sms_vcode;

// Generates vcode
function generate_vcode(code_type, target, target_type, mobile_code, callback) {
    //target = tools.guessTarget(mobile_code, target)

    if (!mobile_code) {
        mobile_code = '86';
    }

    var options = {};
    options.target = target;
    options.code_type = code_type;
    options.target_type = target_type;

    vCodeService.get(options, function(err, vcode){
        if (err) {
            return callback(err);
        }

        if (vcode) {
            var result = {
                id: vcode.id
            };

            if ((vcode.start_time.getTime() + F.config.vcode_resend_interval) > Date.now()) {
                result.renew = 2;
                return callback(null, result);
            } else {
                // receate vcode
                result.renew = 1;
                var newCode = tools.generateAuthCode();
                var nowtime = new Date();

                vcode.code = newCode;
                vcode.valid_time = nowtime.getTime() + F.config.vcode_resend_valid;
                vcode.start_time = nowtime.getTime();
                vcode.ttl = 5;

                if (target_type == 'phone') {
                    // TODO: sanity check on phone number.
                    if (mobile_code == '86') {
                        tools.sendActivePhoneMessage(target, newCode);
                        vCodeService.addOrCreateDailySmsNumber();
                    }
                }

                vCodeService.update(vcode, function(err){
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, result);
                }, true);
            }
        } else {
            vCodeService.create(options, function(err, newVCode){
                if (err) {
                    return callback(err);
                }

                var result = {
                    id: newVCode.id
                };

                if (target_type == 'phone')  {
                    // TODO: sanity check on phone number.
                    if (mobile_code == '86') {
                        tools.sendActivePhoneMessage(target, newVCode.code);
                        vCodeService.addOrCreateDailySmsNumber();
                    }
                }

                return callback(null, result);
            }, true);
        }
    });
}

function generate_captcha_url(graphvCode) {
    if (graphvCode) {
        var filename = encrypt_filename(graphvCode.target);
        return '/' + graphvCode.code_type + '/captcha/' + filename + '.' + img_extension;
    } else {
        return null;
    }
}

var ENCRYPTMAP = {'0':'9','1':'0','2':'7','3':'2','4':'5','5':'4','6':'3','7':'6','8':'1','9':'8'};
var DECRYPTMAP = {'9':'0','0':'1','7':'2','2':'3','5':'4','4':'5','3':'6','6':'7','1':'8','8':'9'};
function encrypt_filename(target) {
    if (!target || typeof target !== 'string' || target.length == 0) {
        return target;
    }
    var filename = '';
    for (var i = 0; i < target.length; i++) {
        if (i % 2 !== 0) {
            filename += tools.generateAuthCode(1);
        }
        var k = target[i];
        if (ENCRYPTMAP[k]) {
            filename += ENCRYPTMAP[k];
        } else {
            filename += k;
        }
    }
    filename = tools.generateAuthCode(2) + filename + tools.generateAuthCode(2);
    return filename;
}

function decrypt_filename(filename) {
    if (!filename || typeof filename !== 'string' || filename.length < 5) {
        return filename;
    }
    var start = 2, end = filename.length - 2;
    filename = filename.substring(start, end);
    var target = '';
    for (var i = 0; i < filename.length; i++) {
        if (i % 3 !== 1) {
            var k = filename[i];
            if (DECRYPTMAP[k]) {
                target += DECRYPTMAP[k];
            } else {
                target += k;
            }
        }
    }
    return target;
}
