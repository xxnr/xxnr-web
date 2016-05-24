/**
 * Created by pepelu on 2016/4/29.
 */
var vCodeModel = require('../models').vcode;
var tools = require('../common/tools');

var vCodeService = function(){};

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
    })
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
    })
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
    })
}

module.exports = new vCodeService();