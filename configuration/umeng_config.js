/**
 * Created by zhouxin on 2016/03/18.
 */
const pay = 1,  ziti = 2, zitiDone = 3, delivery = 4;
const userOrderDetail = 'userOrderDetail', RSCOrderDetail = 'RSCOrderDetail';
var umengConfig = {
	host: "msg.umeng.com",
	uploadPath: "/upload",
	sendPath: "/api/send",
	sendMethod: "POST",
    androidAppKey: "564d588ce0f55a25e9003ec7",
    androidAppMasterSecret: "6okmwiqbfj4orlhvkjajhrkf01wgvsm7",
    iosAppKey: "5667cfe867e58ebc630024d7",
    iosAppMasterSecret: "drlz3fyc7xkiqyqqroasacgvzutefjj8",
    alias_type: "xxnr",
    types: {'pay': pay, 'ziti': ziti, 'zitiDone': zitiDone, 'delivery': delivery},
    body: {}
};
umengConfig.body[pay] = {
    'user': {
            'after_open': "go_activity",
            'activity': "MyOrderDetailActivity",
            'ticker': "您有一笔订单未完成，请尽快支付",
            'title': "有商品到服务站啦！",
            'text': "您订单中有商品已到服务站，请尽快完成付款",
            'IOSpage': userOrderDetail
        }
};
umengConfig.body[ziti] = {
    'user': {
        'after_open': "go_activity",
        'activity': "MyOrderDetailActivity",
        'ticker': "您的商品可以自提啦！",
        'title': "商品可以自提啦！",
        'text': "您订单中有商品已到服务站，请到网点自提",
        'IOSpage': userOrderDetail
    },
    'RSC': {
        'after_open': "go_activity",
        'activity': "RscOrderDetailActivity",
        'ticker': "您有一笔订单可通知客户自提",
        'title': "请提前准备自提商品",
        'text': "您网点有商品可通知客户自提，点击查看详情",
        'IOSpage': RSCOrderDetail
    }
};
umengConfig.body[zitiDone] = {
    'user': {
        'after_open': "go_activity",
        'activity': "MyOrderDetailActivity",
        'ticker': "您有商品自提成功！",
        'title': "商品自提完成",
        'text': "您订单中有商品自提成功，点击查看详情",
        'IOSpage': userOrderDetail
    }
};
umengConfig.body[delivery] = {
    'RSC': {
        'after_open': "go_activity",
        'activity': "RscOrderDetailActivity",
        'ticker': "您有一笔订单中的商品待配送",
        'title': "请尽快配送商品",
        'text': "您网点有商品可配送，点击查看详情",
        'IOSpage': RSCOrderDetail
    }
};
umengConfig.retryCodes = [2028, 4000, 4001, 4002, 4009, 4021, 4023];
umengConfig.production_mode = require('../config').environment==='production';

module.exports = umengConfig;