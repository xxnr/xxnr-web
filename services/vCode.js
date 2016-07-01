/**
 * Created by pepelu on 2016/4/29.
 */
var vCodeModel = require('../models').vcode;
var graphvCodeModel = require('../models').graphvCode;
var ipThrottleModel = require('../models').ipThrottle;
var dailySmsNumberModel = require('../models').dailySmsNumber;
var tools = require('../common/tools');

var vCodeService = function(){};

// sms vcode
vCodeService.prototype.create = function(options, callback) {
    var vcode = new vCodeModel({
        id: U.GUID(10),
        code: tools.generateAuthCode(),
        code_type: options.code_type,
        target: options.target,
        target_type: options.target_type
    });

    vcode.save(function (err) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, vcode);
    });
};

vCodeService.prototype.verify = function(options, callback) {
    var id, target, code_type, code;
    if (options.id)
        id = options.id;
    if (options.target)
        target = options.target;
    if (options.code_type)
        code_type = options.code_type;
    if (options.code)
        code = options.code;

    getByIdentity(id, target, code_type, function (err, vcode) {
        if (err) {
            return callback(err);
        }
        if (!vcode) {
            return callback(null, {'type': 5, 'data': '没有查找到验证码'});
        }
        if (vcode.ttl <= 0) {
            return callback(null, {'type': 4, 'data': '错误次数太多，请重新获取'});
        }
        if (vcode.valid_time < Date.now()) {
            return callback(null, {'type': 3, 'data': '验证码已过期，请重新获取'});
        }
        if (vcode.code !== code) {
            vcode.ttl--;
            // Updates vcode into the database
            var queryoptions = {target: vcode.target, code_type: vcode.code_type};
            var operatoroptions = {ttl: vcode.ttl};
            vCodeModel.update(queryoptions, {$set:operatoroptions}, function(err){
                if (err) {
                    return callback(err);
                }

                return callback(null, {'type': 2, 'data': '验证码输入错误'});
            });
        } else {
            var returncall = function (err) {
                if (err) {
                    return callback(err);
                }

                return callback(null, {'type': 1, 'data': vcode});
            };

            vCodeModel.find({target: vcode.target, code_type: vcode.code_type}).remove(function(err){returncall(err);});
        }
    });
};

// Updates vcode
vCodeService.prototype.update = function(model, callback){
    vCodeModel.update({id:model.id}, {$set:model}, function(err){
        if (err) {
            return callback(err);
        }

        return callback();
    });
};

vCodeService.prototype.get = function(options, callback){
    var id, target, code_type;
    if (options.id)
        id = options.id;
    if (options.target)
        target = options.target;
    if (options.code_type)
        code_type = options.code_type;

    getByIdentity(id, target, code_type, callback);
};

// Gets vcode by identity
function getByIdentity(id, target, code_type, callback) {
    // Gets a specific document from DB
    var queryoptions = {};
    if (id)
        queryoptions = {id:id};
    if (target && code_type)
        queryoptions = {target:target,code_type:code_type};

    vCodeModel.findOne(queryoptions, function(err, doc){
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, doc);
        }
    });
}

// graph vcode
// Gets graph vcode by identity
function getGraphvCodeByIdentity(target, ip, target_type, code_type, callback) {
    // Gets a specific document from DB
    var queryoptions = {};
    if (target)
        queryoptions.target = target;
    if (ip)
        queryoptions.ip = ip;
    if (target_type)
        queryoptions.target_type = target_type;
    if (code_type)
        queryoptions.code_type = code_type;

    graphvCodeModel.findOne(queryoptions, function(err, doc) {
        if (err) {
            console.error('vCodeService getGraphvCodeByIdentity findOne err:', err);
            return callback(err, null);
        } else {
            return callback(null, doc);
        }
    });
}

vCodeService.prototype.getGraphvCode = function(options, callback) {
    var target, ip, target_type, code_type;
    if (!options.target || !options.code_type) {
        callback('target code_type is need');
        return;
    }
    target = options.target;
    if (options.ip)
        ip = options.ip;
    if (options.target_type)
        target_type = options.target_type;
    if (options.code_type)
        code_type = options.code_type;
    getGraphvCodeByIdentity(target, ip, target_type, code_type, callback);
}

vCodeService.prototype.createGraphvCode = function(options, callback) {
    if (!options.target || !options.code_type) {
        callback('target code_type is need');
        return;
    }
    var graphvCode = new graphvCodeModel({
        code: tools.randomWord(),
        code_type: options.code_type,
        target: options.target,
        target_type: options.target_type,
        ip: options.ip
    });

    graphvCode.save(function (err) {
        if (err) {
            console.error('vCodeService createGraphvCode save err:', err);
            return callback(err, null);
        }

        return callback(null, graphvCode);
    });
};

vCodeService.prototype.verifyGraphvCode = function(options, callback) {
    var target, ip, target_type, code_type, code;
    if (!options.target || !options.code_type || !options.code) {
        callback('target code_type code is need');
        return;
    }
    target = options.target;
    if (options.ip)
        ip = options.ip;
    if (options.target_type)
        target_type = options.target_type;
    if (options.code_type)
        code_type = options.code_type;
    if (options.code)
        code = options.code;
    getGraphvCodeByIdentity(target, ip, target_type, code_type, function (err, graphvCode) {
        if (err) {
            return callback(err);
        }
        if (!graphvCode) {
            return callback(null, {'type': 3, 'data': '没有查找到验证码'});
        }
        if (graphvCode.code.toLowerCase() !== code.toLowerCase()) {
            return callback(null, {'type': 2, 'data': '验证码输入错误'});
        }
        var queryoptions = {target: graphvCode.target};
        if (graphvCode.ip)
            queryoptions.ip = graphvCode.ip;
        if (graphvCode.target_type)
            queryoptions.target_type = graphvCode.target_type;
        if (graphvCode.code_type)
            queryoptions.code_type = graphvCode.code_type;

        callback(null, {'type': 1, 'data': graphvCode});
        graphvCodeModel.find(queryoptions).remove(function(err){
            if (err)
                console.error('vCodeService verifyGraphvCode findremove err:', err);
            return;
        });
    });
};

vCodeService.prototype.updateOrCreateGraphvCode = function(options, callback) {
    if (!options.target || !options.code_type) {
        callback('target code_type is need');
        return;
    }
    var self = this;
    var queryoptions = {target: options.target};
    if (options.ip)
        queryoptions.ip = options.ip;
    if (options.target_type)
        queryoptions.target_type = options.target_type;
    if (options.code_type)
        queryoptions.code_type = options.code_type;
    var updateoptions = {};
    updateoptions.code = tools.randomWord();
    updateoptions.start_time = new Date();
    options.code = updateoptions.code;
    options.start_time = updateoptions.start_time;
    
    graphvCodeModel.update(queryoptions, {$set:updateoptions}, function(err, count) {
        if (err) {
            return callback(err);
        }
        if (count && count.n == 0) {
            self.createGraphvCode(options, function(err, graphvCode){
                if (err) {
                    return callback(err);
                }
                return callback(null, graphvCode);
            });
            return;
        }
        return callback(null, options);
    });
}


// ip throttle
vCodeService.prototype.getAndAddIpThrottle = function(options, callback) {
    if (!options.ip || !options.type) {
        callback('ip type is need');
        return;
    }
    var self = this;
    var queryoptions = {ip: options.ip, type:options.type};
    ipThrottleModel.findOneAndUpdate(queryoptions, {$inc:{num: 1}}, {new: true}, function(err, ipThrottle) {
        if (err) {
            return callback(err);
        }
        if (ipThrottle) {
            return callback(null, ipThrottle);
        } else {
            callback(null);
            self.createIpThrottle(options, function(err) {});
            return;
        }
    });
}

vCodeService.prototype.createIpThrottle = function(options, callback) {
    if (!options.ip || !options.type) {
        callback('ip type is need');
        return;
    }
    var ipThrottle = new ipThrottleModel({
        ip: options.ip,
        type: options.type
    });

    ipThrottle.save(function (err) {
        if (err) {
            console.error('vCodeService createIpThrottle save err:', err);
            return callback(err, null);
        }

        return callback(null, ipThrottle);
    });
};

// daily Sms Number
vCodeService.prototype.getDailySmsNumber = function(options, callback) {
    dailySmsNumberModel.findOne({}, function(err, dailySmsNumber) {
        if (err) {
            return callback(err);
        }
        if (dailySmsNumber) {
            return callback(null, dailySmsNumber);
        } else {
            return callback(null);
        }
    });
}

vCodeService.prototype.addOrCreateDailySmsNumber = function(options, callback) {
    dailySmsNumberModel.findOneAndUpdate({}, {$inc:{num: 1}}, {new: true}, function(err, dailySmsNumber) {
        if (err) {
            console.error('vCodeService addOrCreateDailySmsNumber findOneAndUpdate err:', err);
            if (callback) {
                callback(err);
            }
            return;
        }
        if (!dailySmsNumber) {
            dailySmsNumber = new dailySmsNumberModel();
            dailySmsNumber.save(function (err) {
                if (err) {
                    console.error('vCodeService addOrCreateDailySmsNumber save err:', err);
                    if (callback) {
                        callback(err);
                    }
                    return;
                }
                if (callback) {
                    callback(null, dailySmsNumber);
                }
                return;
            });
        }
    });
};

module.exports = new vCodeService();