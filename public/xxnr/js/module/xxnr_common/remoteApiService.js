/**
 * Created by pepelu on 2015/9/9.
 */
var app = angular.module('xxnr_common');
app.service('remoteApiService', function(commonService){
    var user = commonService.user;
    this.getPointList = function(page, rows){
        var params={
            methodname:'api/v2.0/point/findPointList',
            locationUserId:user.userid,
            page:page,
            rows:rows,
            userId:user.userid
        };
        return commonService.ajax(params);
    };

    this.addOrder = function(shoppingCartId, addressId, products){
        var params = {
            'methodname':'api/v2.0/order/addOrder',
            'locationUserId':user.userid,
            'shopCartId':shoppingCartId,
            'userId':user.userid,
            'addressId':addressId,
            'products':JSON.stringify(products)
        };

        return commonService.ajax(params);
    };

    this.getOrderList = function(page, type){
        var params={
            methodname:'api/v2.0/order/getOderList',
            page:page,
            typeValue:type,//订单类型  所有的订单
            userId:user.userid,
            locationUserId:user.userid
        };
        return commonService.ajax(params);
    };

    this.getOrderDetail = function(orderId){
        var params={
            methodname:'/app/order/getOrderDetails',
            locationUserId:user.userid,
            orderId:orderId,
            userId:user.userid
        };
        return commonService.ajax(params);
    };

    this.getCommentList = function(page, rows){
        var params={
            methodname:'app/comment/MyJudgeList',
            page:page,
            rows:rows,
            userId:user.userid,
            locationUserId:user.userid
        };
        return commonService.ajax(params);
    };

    this.getBasicUserInfo = function(){
        var params={
            methodname:'api/v2.0/user/get',
            id:user.userid
        };
        return commonService.ajax(params);
    };

    this.getAddressList = function(){
        var params={
            methodname:'api/v2.0/user/getUserAddressList',
            userId:user.userid,
            locationUserId:user.userid
        };
        return commonService.ajax(params);
    };

    this.saveUserAddress = function(buildUserType, receiptPhone, receiptName, consigneeAddress, areaId, cityId, countyId){
        var params={
            methodname:'api/v2.0/user/saveUserAddress',
            userId:user.userid,
            type:buildUserType,
            receiptPhone:receiptPhone,
            receiptPeople:receiptName,
            address:consigneeAddress,
            areaId:areaId,
            cityId:cityId,
            countyId:countyId
        };
        return commonService.ajax(params);
    };

    this.updateUserAddress = function(addressId, areaId, address, receiptName, receiptPeople, type, cityId, countyId){
        var params={
            methodname:'api/v2.0/user/updateUserAddress',
            userId:user.userid,
            addressId:addressId,
            areaId:areaId,
            address:address,
            receiptPhone:receiptName,
            receiptPeople:receiptPeople,
            type:type,
            cityId:cityId,
            countyId:countyId
        };
        return commonService.ajax(params);
    };

    this.deleteUserAddress = function(addressId){
        var params = {
            'methodname':'api/v2.0/user/deleteUserAddress',
            'addressId':addressId,
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.getProvinceList = function(){
        var params={
            methodname:'api/v2.0/area/getAreaList',
            locationUserId:user.userid
        };
        return commonService.ajax(params);
    };

    this.getCityList = function(provinceId){
        var params={
            methodname:'api/v2.0/businessDistrict/getBusinessByAreaId',
            locationUserId:user.userid,
            areaId:provinceId
        };
        return commonService.ajax(params);
    };

    this.getCountyList = function(cityId){
        var params={
            methodname:'api/v2.0/build/getBuildByBusiness',
            locationUserId:user.userid,
            businessId:cityId
        };
        return commonService.ajax(params);
    };

    this.getShoppingCart = function(){
        var params={
            'methodname':'/api/v2.0/getShoppingCart',
            'locationUserId':user.userid,
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.changeCartNum = function(goodId, newCount){
        var params={
            methodname:'api/v2.0/updateShoppingCart',
            locationUserId:user.userid,
            userId:user.userid,
            goodsId:goodId,
            quantity:newCount
        };
        return commonService.ajax(params);
    };

    this.cancleOrder = function(orderId){
        var params={
            methodname:'app/order/cancelOrder',
            locationUserId:user.userid,
            userId:user.userid,
            orderId:orderId
        };
        return commonService.ajax(params);
    };

    this.confirmReceipt = function(orderId){
        var params = {
            'methodname':'app/order/confirmReceipt',
            'locationUserId':user.userid,
            'userId':user.userid,
            'orderNo':orderId
        };
        return commonService.ajax(params);
    };

    this.aquireService = function(orderId){
        var params = {
            'methodname':'app/order/salesReturnOrder',
            'locationUserId':user.userid,
            'userId':user.userid,
            'orderId':orderId
        };
        return commonService.ajax(params);
    };

    this.uploadHeadPortrait = function(file){
        var params = {
            'methodname':'app/res/uploadHeadPortrait',
            'resFile':file,
            'locationUserId':user.userid,
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.addAddressToOrder = function(orderId, addressId){
        var params = {
            'methodname':'app/order/addBuildingUserId',
            'locationUserId':user.userid,
            'orderDataId':orderId,
            'buildingUserId':addressId
        };
        return commonService.ajax(params);
    };

    this.addDeliveryTimeToOrder = function(orderId, time){
        var params = {
            'methodname':'app/order/addDeliveryTime',
            'locationUserId':user.userid,
            'orderDataId':orderId,
            'deliveryTime':time
        };
        return commonService.ajax(params);
    };

    this.addRemarksToOrder = function(orderId, remarks){
        var params = {
            'methodname':'app/order/addRemarksByOrderId',
            'locationUserId':user.userid,
            'orderDataId':orderId,
            'remarks':remarks
        };
        return commonService.ajax(params);
    };

    this.submitOrder = function(orderId){
        var params = {
            'methodname':'app/order/affirmOrder',
            'locationUserId':user.userid,
            'userId':user.userid,
            'orderDataId':orderId
        };
        return commonService.ajax(params);
    };

    this.getProducts = function(page, max, categoryId){
        var params={
            methodname:'/api/v2.0/products/',
            userId:user.userid,
            page:page,
            max:max,
            category:categoryId
        };
        return commonService.ajax(params);
    };

	this.getCategories = function(){
        var params={
            methodname:'/api/v2.0/products/categories/'
        };

        return commonService.ajax(params);
	};
    this.login = function(userName, password){
        var params={
            methodname:'api/v2.0/user/login',
            account:userName,
            password:password
        };
        return commonService.ajax(params);
    };
    this.sendCode = function(phoneNumber, bizCode){
        var params = {
            methodname:'api/v2.0/sms',
            bizcode:bizCode,
            tel:phoneNumber
        };
        return commonService.ajax(params);
    };
    this.resetPassword = function(phoneNumber, newPassword, code){
        var params ={
            "methodname":"api/v2.0/user/resetpwd",
            "account":phoneNumber,
            "newPwd":newPassword,
            "smsCode":code
        };
        return commonService.ajax(params);
    };
    this.regist = function(phoneNumber, password, code, nickName){
        var params = {
            methodname:'api/v2.0/user/register',
            account:phoneNumber,
            password:password,
            smsCode:code,
            regMethod:'1',
            nickname:nickName
        };
        return commonService.ajax(params);
    };
    this.getProductDetail = function(productId){
        var params={
            'methodname':'api/v2.0/product/getGoodsDetails',
            'locationUserId':user.userid,
            'goodsId':productId
        };
        return commonService.ajax(params);
    };
    this.getGoodsListPage = function(page, rowCount, classId){
        var params={
            methodname:'api/v2.0/product/getGoodsListPage',
            locationUserId:user.userid,
            page:page,
            rows:rowCount,
            classId:classId
        };
        return commonService.ajax(params);
    };

    this.addToShoppingCart = function(id, count, update_by_add){
        if(!user || !user.userid){
            window.location.href="logon.html";
           return;
        }

        var params = {
            methodname:'api/v2.0/addToCart',
            locationUserId:user==null?'':user.userid,
            goodsId:id,
            userId:user.userid,
            count:count,
            update_by_add:update_by_add
        };
        return commonService.ajax(params);
    };
});
