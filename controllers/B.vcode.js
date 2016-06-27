var tools = require('../common/tools');
var services = require('../services');
var UserService = services.user;
var vCodeService = services.vCode;

exports.install = function() {
	// SMS
	//F.route('/api/v2.0/sms/',					generate_sms, ['get', 'post']);

	// v1.0
	//fix api// F.route('/app/sms/',						generate_sms, ['get', 'post']);
};

// ==========================================================================
// SMS
// ==========================================================================

// Generates sms
exports.generate_sms = function(req, res, next) {
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
                    res.respond({'code': '1001', 'message': '该手机号未注册，请重新输入'});
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
                    }
                }

                return callback(null, result);
            }, true);
        }
    });
}
