/**
 * Created by zhouxin on 2016/03/18.
 */
const pay = 1,  ziti = 2, zitiDone = 3;
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
    types: {'pay': pay, 'ziti': ziti, 'zitiDone': zitiDone},
    body: {}
};
umengConfig.body[pay] = {'after_open': "go_activity", 'activity': "MyOrderDetailActivity", 'ticker': "您有一笔订单未完成，请尽快支付", 'title': "有商品到服务站啦！", 'text': "您订单中的商品已到服务站，请尽快完成付款"};
umengConfig.body[ziti] = {'after_open': "go_activity", 'activity': "MyOrderDetailActivity", 'ticker': "您的商品可以自提啦！", 'title': "商品可以自提啦！", 'text': "您订单中的商品已到服务站，请到网点自提"};
umengConfig.body[zitiDone] = {'after_open': "go_activity", 'activity': "MyOrderDetailActivity", 'ticker': "您有商品自提成功！", 'title': "商品自提完成", 'text': "您订单中的有商品自提成功，点击查看详情"};
umengConfig.retryCodes = [2028, 4000, 4001, 4002, 4009, 4021, 4023];

module.exports = umengConfig;