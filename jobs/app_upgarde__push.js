/**
 * Created by CAI on 2016/6/8.
 */
global.F = {
    config:require('../config'),
    global:require('../global')
};

var services = require('../services');
var AppupgradeService = services.Appupgrade;
var moment = require('moment');

// query all orders
AppupgradeService.isNeedPush(function (err,result) {
    if (err) {
        console.error("AppUpgrade isNeedPush err:", err);
        return;
    }
    console.log("AppUpgrade isNeedPush result:", result);
    process.exit(0);
});