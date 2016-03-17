// "use strict";

const UNPAID = 1, PAID = 2, PARTPAID = 3;
const UNDELIVERED = 1, DELIVERED = 2, PARTDELIVERED = 3, RSCRECEIVED = 4;
const ZHIFUBAO = 1, UNIONPAY = 2;
const ZITI = 1, SONGHUO = 2;
const OFFLINEPAYTYPE = {CASH:3, POS:4};

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
        "RSCRECEIVED":RSCRECEIVED
    });
    exports.PAYTYPE = Object.freeze({
        "ZHIFUBAO":ZHIFUBAO,
        "UNIONPAY":UNIONPAY,
        "CASH":OFFLINEPAYTYPE.CASH,
        "POS":OFFLINEPAYTYPE.POS
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
    exports.DELIVERYTYPE = Object.freeze({
        "ZITI":{
            "id":ZITI,
            "name":"网点自提"
        },
        "SONGHUO":{
            "id":SONGHUO,
            "name":"送货到家"
        }
    });
    var deliveryTypeSort = {};
    deliveryTypeSort[SONGHUO]=10;
    deliveryTypeSort[ZITI]=20;

    exports.DELIVERYTYPESORT = Object.freeze(deliveryTypeSort);
})(typeof exports === 'undefined'? this['defs']={}: exports);