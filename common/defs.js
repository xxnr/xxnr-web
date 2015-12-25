// "use strict";

const UNPAID = 1, PAID = 2, PARTPAID = 3;
const UNDELIVERED = 1, DELIVERED = 2, PARTDELIVERED = 3;
const ZHIFUBAO = 1, UNIONPAY = 2;

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
        "PARTDELIVERED":PARTDELIVERED
    });
    exports.PAYTYPE = Object.freeze({
        "ZHIFUBAO":ZHIFUBAO,
        "UNIONPAY":UNIONPAY
    });
})(typeof exports === 'undefined'? this['defs']={}: exports);