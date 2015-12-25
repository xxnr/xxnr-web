/**
 * Created by pepelu on 2015/12/8.
 */

require('total.js');
var services = require('../services');
var dri = require('../common/dri');
var OrderService = services.order;
var moment = require('moment');

// query all orders
OrderService.closeOrders(function(err, count){
    if(err){
        dri.sendDRI('[JOB] close_order fail: ' + err);
        return;
    }

    console.log('[', new Date(), ']', count, 'order(s) closed in total');
    process.exit(0);
});