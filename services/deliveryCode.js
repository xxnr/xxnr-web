/**
 * Created by pepelu on 2016/3/15.
 */
var DeliveryCodeModel = require('../models').deliveryCode;
var OrderModel = require('../models').order;

var DeliveryCodeService = function(){};

DeliveryCodeService.prototype.getCodeByOrderId = function(orderId, callback){
    if(!orderId){
        callback('orderId required');
        return;
    }

    DeliveryCodeModel.findOne({orderId:orderId}, function(err, doc){
        if(err){
            console.error(err);
            callback('查询提货码失败');
            return;
        }

        if(!doc){
            callback('该订单无提货码');
            return;
        }

        callback(null, doc.code);
    })
};

DeliveryCodeService.prototype.checkDeliveryCode = function(orderId, code, callback){
    if(!orderId){
        callback('orderId required');
        return;
    }

    if(!code){
        callback('code required');
        return;
    }

    DeliveryCodeModel.findOne({orderId:orderId}, function(err, doc){
        if(err){
            console.error(err);
            callback('提货失败');
            return;
        }

        if(!doc){
            callback('该订单无提货码');
            return;
        }

        callback(null, doc.code != code);
    })
};

module.exports = new DeliveryCodeService();