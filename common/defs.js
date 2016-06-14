// "use strict";

const UNPAID = 1, PAID = 2, PARTPAID = 3;
const UNDELIVERED = 1, DELIVERED = 2, PARTDELIVERED = 3, RSCRECEIVED = 4, RECEIVED = 5;
const ZHIFUBAO = 1, UNIONPAY = 2, EPOS = 5;
const ZITI = 1, SONGHUO = 2;
const OFFLINEPAYTYPE = {CASH:3, POS:4};
const DELIVERYTYPE = {
    "ZITI":{
        "id":ZITI,
        "name":"网点自提"
        },
    "SONGHUO":{
        "id":SONGHUO,
        "name":"配送到户"
        }
    };
const loyaltyPointsType = {
    "ORGANIZINGINFO": {'type':1, 'name':'完善资料'},
    "SIGNIN": {'type':2, 'name':'每日签到'},
    "ORDERCOMPLETED": {'type':3, 'name':'完成订单', 'refName':'order'},
    "EXCHANGE": {'type':4, 'name':'积分兑换', 'refName':'rewardshopgift'},
    "COMPAIGNREWARD": {'type':5, 'name':'活动奖励', 'refName':'compaign'}
};
var deliveryTypeSort = {};
deliveryTypeSort[SONGHUO]=10;
deliveryTypeSort[ZITI]=20;

var deliveryTypeName = {};
deliveryTypeName[SONGHUO]=DELIVERYTYPE.SONGHUO.name;
deliveryTypeName[ZITI]=DELIVERYTYPE.ZITI.name;

(function(exports){
    // your code goes here
    /*exports.test = function(){
        return 'hello world'
    };*/
	exports.PAYMENTSTATUS = Object.freeze({
		"UNPAID":UNPAID,
		"PAID":PAID,
        "PARTPAID":PARTPAID
	});
    exports.DELIVERSTATUS = Object.freeze({
        "UNDELIVERED":UNDELIVERED,
        "DELIVERED":DELIVERED,
        "PARTDELIVERED":PARTDELIVERED,
        "RSCRECEIVED":RSCRECEIVED,
        "RECEIVED":RECEIVED
    });
    exports.PAYTYPE = Object.freeze({
        "ZHIFUBAO":ZHIFUBAO,
        "UNIONPAY":UNIONPAY,
        "CASH":OFFLINEPAYTYPE.CASH,
        "POS":OFFLINEPAYTYPE.POS,
        "EPOS":EPOS
    });
    exports.OFFLINEPAYTYPE = [
        {
            "type":OFFLINEPAYTYPE.CASH,
            "name":"现金"
        },
        {
            "type":OFFLINEPAYTYPE.POS,
            "name":"线下POS机"
        }
    ];
    exports.SUBORDERTYPE = Object.freeze({
        "DEPOSIT":"deposit",
        "BALANCE":"balance",
        "FULL":"full"
    });
    exports.SUBORDERTYPEKEYS = Object.freeze(
        ["DEPOSIT","BALANCE","FULL"]
    );
    exports.DELIVERYTYPE = Object.freeze(DELIVERYTYPE);
    exports.DELIVERYTYPESORT = Object.freeze(deliveryTypeSort);
    exports.DELIVERYTYPENAME = Object.freeze(deliveryTypeName);
    exports.LOYALTYPOINTSTYPE = Object.freeze(loyaltyPointsType);
})(typeof exports === 'undefined'? this['defs']={}: exports);