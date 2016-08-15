/**
 * Created by zhouxin on 2016/07/12.
 */
var umengConfig = {
	//Android IOS app最新版本号
	nowIosVersion: '2.2.3',
    nowAndroidVersion: '2.3.2'
};

umengConfig.version_map = {
	'android': {
		'2.3.1': '1.积分商城全新上线，精美礼品等你兑换\n2.签到规则改装升级，连续签到积分翻倍\n3.完成订单奖励积分，还能兑换礼品呦',
		'2.3.2': '活动-全新的玩法！\n1.分享活动抢积分，快来一起试试呀\n2.竞猜奥运金牌数，猜对还能领积分\n3.挑战问答涨知识，精美礼品等你换'
	},
	'ios': {
		'2.2.1': '1.新增配送方式，购车可自选网点提车\n2.网点支持付现金或POS机刷卡，支付更安心\n3.自提订单凭自提码至网点，提车有保障',
		'2.2.2': '1.新增购车网点自提\n2.网点支持线下支付\n3.支持自提码网点提车',
		'2.2.3': '1.优化界面设计，更简洁更时尚\n2.优化交互体验，操作更流畅'
	}
};

module.exports = umengConfig;