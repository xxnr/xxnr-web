/**
 * Created by CAI on 2016/6/8.
 */

var services = require('../services');
var AppupgradeService = services.Appupgrade;
var moment = require('moment');

// query all orders
AppupgradeService.isNeedPush(function (err) {
    if (err) {
        console.error("AppUpgrade isNeedPush err", err);
        return;
    }
    process.exit(0);
});