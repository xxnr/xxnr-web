/**
 * Created by CAI on 2016/6/7.
 */
var AppUpgrade = require('../models').app_Device_Version;
var UMENG = require('../modules/umeng');


// Service
var AppUpgradeService = function () {
};

// Method
//是否需要发送app升级推送
AppUpgradeService.prototype.isNeedPush = function (callback) {
    var self = this;
    var nowIosVersion = F.config.nowIosVersion;
    var nowAndroidVersion = F.config.nowAndroidVersion;

    AppUpgrade.find({'date_update': {$lte: new Date().add('days', -15)}})
        .select('device_token date_update user_agent version')
        .exec(function (err, docs) {
            if (err) {
                console.error('AppUpgradeService isNeedPush find err:', err);
                callback(err);
                return;
            }
            if (!docs || docs.length == 0) {
                callback('没有可以发送的device');
                return;
            }
            var update_callback = function (err, result, device_tokens) {
                if (err) {
                    callback(err);
                    console.error("AppUpgradeService isNeedPush update_callback err:", err);
                    return;
                }
                try {
                    if (result && JSON.parse(result).ret == 'SUCCESS') {
                        if (device_tokens) {
                            var device_token_List = device_tokens.split(',');
                            AppUpgrade.update({'device_token': {$in: device_token_List}}
                                , {$set: {'date_update': new Date()}}
                                , {multi: true}
                                , function (err) {
                                    if (err) {
                                        callback(err);
                                        console.error("AppUpgradeService isNeedPush update_callback update err:", err);
                                    }
                                    callback(null, result);
                                })
                        }
                    }
                } catch (e) {
                    callback(err);
                }
            };

            var ios_device_tokens = "";
            var android_device_tokens = "";
            var ios_count = 0;
            var android_count = 0;

            //遍历处理
            docs.forEach(function (doc) {
                if (doc.user_agent == 'android' && compareVersion(nowAndroidVersion, doc.version)) {
                    android_device_tokens += doc.device_token + ",";
                    android_count++;
                } else if (doc.user_agent == 'ios' && compareVersion(nowIosVersion, doc.version)) {
                    ios_device_tokens += doc.device_token + ",";
                    ios_count++;
                }
                if (ios_count == 500) {
                    UMENG.sendIOSListCast(ios_device_tokens.substring(0, ios_device_tokens.length - 1), update_callback);
                    ios_count = 0;
                    ios_device_tokens = "";
                }
                if (android_count == 500) {
                    UMENG.sendAndroidListCast(android_device_tokens.substring(0, android_device_tokens.length - 1), update_callback);
                    android_device_tokens = "";
                    android_count = 0;
                }
            });

            if (ios_count >= 1) {
                UMENG.sendIOSListCast(ios_device_tokens, update_callback);
            }
            if (android_count >= 1) {
                UMENG.sendAndroidListCast(android_device_tokens, update_callback);
            }
        });
};

// saveAndUpdate DeviceTokenVersion
AppUpgradeService.prototype.saveAndUpdate = function (options, callback) {

    AppUpgrade.findOne({device_id: options.device_id}, function (err, doc) {
        if (err) {
            callback(err);
            return
        }
        if (doc) {
            var query = {device_id: options.device_id};
            AppUpgrade.update(query, {
                device_token: options.device_token,
                version: options.version,
                date_update: new Date()
            }, options, function (err) {
                if (err) {
                    callback(err);
                }
            });
        } else {
            var deviceVersion = new AppUpgrade(options);
            deviceVersion.save(function (err) {
                callback(err);
            });
        }
    });
};
/**
 * 比较版本号大小
 * @param nowVersion 最新版本
 * @param version  要比较的版本
 * @returns {boolean}
 */
var compareVersion = function (nowVersion, version) {
    var splitNow = nowVersion.split('.');
    var split = version.split('.');
    for (var i = 0; i < splitNow.length; i++) {
        if (parseInt(splitNow[i]) > parseInt(split[i])) {
            return true;
        }
        if (parseInt(splitNow[i]) < parseInt(split[i])) {
            return false;
        }
    }
    return false;
};

AppUpgradeService.prototype.compareVersion = compareVersion;
module.exports = new AppUpgradeService();

