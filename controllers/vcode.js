var tools = require('../common/tools');

exports.install = function() {
	// SMS
	F.route('/app/sms/',						generate_sms);
};

// ==========================================================================
// SMS
// ==========================================================================

// Generates sms
function generate_sms() {
    var self = this;
    var callbackName = this.query['callback'] || 'callback';
    var requestType = '';
    var code_type, target;
    var target_type = 'phone';
    var mobile_code = '86';
    if (self.query.bizcode)
        requestType = self.query.bizcode;

    if (requestType === 'resetpwd') {
        if (!self.query.tel || !tools.isPhone(self.query.tel)) {
            self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的tel参数'});
            return;
        } else {
            code_type = 'resetpwd';
            target = self.query.tel;
            var user = {'account':target};

            GETSCHEMA('User').get(user, function(err, data) {
                if (!data || err) {
                    self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，未查询到用户'});
                    return;
                } else {
                    generate_vcode(code_type, target, target_type, mobile_code, function(err, result) {
                        if (err) {
                            self.jsonp(callbackName, {'code':'1001','message':'生成vcode错误'});
                            return;
                        } else {
                            if (result && result.renew && result.renew === 2) {
                                self.jsonp(callbackName, {'code':'1001','message':'稍等片刻再获取'});
                                return;
                            }
                            self.jsonp(callbackName, {'code':'1000','message':'success'});
                            return;
                        }
                    });
                }
                
            });
        }
    } else {
        if (requestType === 'register') {
            //if (req.user) {
            //   self.jsonp(callbackName, {'code':'1001','message':'用户已登录，请先登出'});
            //}
            if (!self.query.tel || !tools.isPhone(self.query.tel)) {
                self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的tel参数'});
                return;
            } else {
                code_type = 'register';
                target = self.query.tel;
                var user = {'account':target};

                GETSCHEMA('User').get(user, function(err, data) {
                    if (!data || err) {
                        generate_vcode(code_type, target, target_type, mobile_code, function(err, result) {
                            if (err) {
                                self.jsonp(callbackName, {'code':'1001','message':'生成vcode错误'});
                                return;
                            } else {
                                if (result && result.renew && result.renew === 2) {
                                    self.jsonp(callbackName, {'code':'1001','message':'稍等片刻再获取'});
                                    return;
                                }
                                self.jsonp(callbackName, {'code':'1000','message':'success'});
                                return;
                            }
                        });
                    } else {
                        self.jsonp(callbackName, {'code':'1001','message':'用户已存在'});
                        return;
                    }
                });
            }
        } else {
            self.jsonp(callbackName, {'code':'1001','message':'请求参数错误，无效的bizcode参数'});
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

    GETSCHEMA('VCode').get(options, function(err, vcode) {
        if (err) {
            return callback(err);
        }

        if (vcode) {
            var result = {
                id: vcode.id
            };

            if ((vcode.start_time + F.config.vcode_resend_interval) > Date.now()) {
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

                GETSCHEMA('VCode').workflow('update', vcode, null, function(err) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, result);
                }, true);
            }
        } else {
            GETSCHEMA('VCode').workflow('create', null, options, function(err, newVCode) {
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
