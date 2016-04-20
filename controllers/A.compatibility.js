var express = require('express');
var router = express.Router();
var v10apis = [
	
	/**		*/ /*
	GET_NYC(*/ "/app/goods/getGoodsListPage", /*GetGoodsData.class),
	/**	化肥	*/ /*
	GET_HUAFEI(*/ "/app/goods/getGoodsListPage", /*GetGoodsData.class),
	/**	订单评价详情	*/ /*
	COMMENT_DETAIL(*/ "/app/comment/commentDetails", /*CommentResult.class),
	/**	订单评价	*/ /*
	PINGJIA(*/ "/app/comment/addGoodsComment", /*ResponseResult.class),
	/**	获取400热线电话*//*
	GET_PROFILE_LIST(*/ "/app/profile/getProfileList", /*HotLineResult.class),
	/**银行账户等信息接口	*/ /*
	GET_PROFILE_BANKLIST(*/ "/app/profile/getProfileBankList", /*ProFileResult.class),
	/**	确认订单	*/ /*
	SURE_ORDER(*/ "/app/order/affirmOrder", /*SureOrderResult.class),
	/**	选择期望送货日期接口	*/ /*
	HOPE_TIME(*/ "/app/order/addDeliveryTime", /*ResponseResult.class),
	/**	填写订单备注接口	*/ /*
	ADD_REMARKS_BY_ORDERID(*/ "/app/order/addRemarksByOrderId", /*ResponseResult.class),
	/**	取消订单	*/ /*
	ABOUT_US(*/ "/app/profile/findAboutUs", /*AboutUsResult.class),
	/**	取消订单	*/ /*
	CANCEL_ORDER(*/ "/app/order/cancelOrder", /*ResponseResult.class),
	/**	头像上传	*/ /*
	UP_HEAD_IMG(*/ "/app/res/uploadHeadPortrait", /*CameraResult.class),
	/**	获取首页广告	*/ /*
	GETINDEXPIC(*/ "/home/index/getIndexPic", /*BannerResult.class),
	/** 批量上传购物车数据*/ /*
	SHOPPING_UPLOADING(*/ "/app/shopCart/addToCartBatch", /*BannerResult.class),
	/** 首页轮播图	*/ /*
	GETHOMEPIC(*/ "/app/ad/getAdList", /*HomeImageResult.class),
	/** 首页签到	*/ /*
	SIGN_IN_POINT(*/ "/app/point/signInPoint", /*PointResult.class),
	/**	找回密码	*/ /*
	FIND_PASSWORD(*/ "/app/user/resetpwd", /*FindPassResult.class),
	/**	修改密码	*/ /*
	CHANGE_PASSWORD(*/ "/app/user/modifypwd", /*FindPassResult.class),
	/**	短信验证	*/ /*
	SEND_SMS(null,GetCodeResult.class),
	/**	注册	*/ /*
	REGISTER(*/ "/app/user/register", /*LoginResult.class),
	/**登陆	*/ /*
	LOGIN(*/ "/app/user/login", /* LoginResult.class),
	/**首页获取列表	*/ /*
	GET_GOOSLIST(*/ "/app/goods/getGoodsList", /* GetGoodsData.class),
	/**商品详情	*/ /*
	GET_GOOD_DETAIL(*/ "/app/goods/getWebGoodsDetails", /* GetGoodsDetail.class),
	/**获取购物车信息	*/ /*
	GET_SHOPCART_LIST(*/ "/app/shopCart/getShopCartList", /* GetshopCart.class),
	/** 城市列表接口 	*/ /*
	FINDAREALIST(*/ "/app/area/getAreaList", /* CityList.class),
	/** 对应商圈楼宇列表接口 	*/ /*
	QUERYBYBUSINESSID(*/ "/app/build/getBuildByBusiness", /* BuildingList.class),
	/**保存用户地址	*/ /*
	SAVEORUPDATE(*/ "/app/buildUser/saveAddress", /* SaveAdressList.class),
	/**我的评价	*/ /*
	MY_EVALUATE(*/ "/app/comment/MyJudgeList", /* EvaluateList.class),
	/** 对应城市商圈列表接口 	*/ /*
	QUERYBYAREAID(*/ "/app/businessDistrict/getBusinessByAreaId", /* QueueList.class),
	/** 对应城市商圈列表接口 	*/ /*
	MY_JIFEN(*/ "/app/point/findPointList", /* JifenData.class),

	/**我的订单详情	*/ /*
	GET_ORDER_DETAILS(*/ "/app/order/getOrderDetails", /* MyOrderDetailResult.class),
	/**确认收货接口	*/ /*
	GET_ORDER_CONFIRM(*/ "/app/order/confirmReceipt", /* ResponseResult.class),
	/**我的订单	*/ /*
	GETORDERLIST(*/ "/app/order/getOderList", /* WaitingPay.class),
	/** 购物车修改数目 	*/ /*
	CHANGE_NUM(*/ "/app/shopCart/changeNum", /* ChangeNum.class),
	/** 修改 个人信息	*/ /*
	UPDATE_MYUSER(*/ "/app/user/updateMyUser", /* ResponseResult.class),
	/** 首页添加到购物车	*/ /*
	ADDTOCART(*/ "/app/shopCart/addToCart", /* addtoCart.class),
	/** 预生成订单	*/ /*
	ADD_ORDER(*/ "/app/order/addOrder", /* SureOrder.class),
	/** 获取个人信息	*/ /*
	PERSONAL_CENTER(*/ "/app/user/personalCenter", /* PersonalData.class),
	/** 增加地址	*/ /*
//	SAVE_ADDRESS(*/ "/app/buildUser/saveAddress", /* saveAddress.class),
	SAVE_ADDRESS(*/ "/app/user/saveUserAddress", /* saveAddress.class),
	/** 获取地址列表	*/ /*
	ADDRESS_LIST(*/ "/app/user/getUserAddressList", /* AddressList.class),
	/** 地址列表中删除地址	*/ /*
	DELETE_ADDRESS(*/ "/app/user/deleteUserAddress", /* ResponseResult.class),
	/** 地址列表中修改地址	*/ /*
	UPDATE_ADDRESS(*/ "/app/user/updateUserAddress", /* ResponseResult.class),
	/** 选择配送地址接口	*/ /*
	SELECT_ADDRESS(*/ "/app/order/addBuildingUserId", /* ResponseResult.class),
	/**版本更新接口 	*/ /*
	LATEST_VERSION(*/ "/app/version/latestVersion", /* ResponseResult.class),
	
	/**支付完成回调接口	*/ /*
	PAY_BACK(*/"app/order/payNotify", /*Payback.class ),*/
];

exports.install = function() {
	for(var i=0; i<v10apis.length; i++){
        var v10api = v10apis[i];
        var route = F.findRoute(v10api);
            
        if(route){
            route.execute = new function(v20execute){
                this.compatibleFunction = function(){
                    var result = processV10AppCall.apply(this, arguments);

                    if(result.processed){
                        return result.v10result;
                    }

                    var v20execute = arguments.callee.v20execute;
                    return v20execute.apply(this, arguments);
                };

                this.compatibleFunction.v20execute = v20execute;
            }(route.execute).compatibleFunction;
        }
		else{
			F.route(v10api, processV10AppCall, ['post', 'get', 'upload'], 8);
		}
    }
};

function findRoute(route){
	router.stack.forEach(function(r){
		if(r.route && r.route.path == route){
			return r.route.path
		}
	})
}

const V10UPGRADE_MESSAGE = "新新农人App升级啦！请到应用市场下载新版，体验更好的新农服务";

function processV10AppCall(){
    if(!this.data["user-agent"]){
		if(this.flags.indexOf('upload') >= 0) { // v1.0 android app send all data with 'upload' flag, and no 'user-agent' specified
			if(this.name.indexOf('app/ad/getAdList') >= 0){
				this.data['bannerType'] = 'upgrade';
				return {processed: false, v10result: undefined };
			}
			else{
				this.json({'code':"1812", "message":V10UPGRADE_MESSAGE});
				return {processed: true, v10result: undefined };
			}
		}
	}

    return {processed: false, v10result: undefined };
}