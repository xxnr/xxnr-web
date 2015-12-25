/**
 * Created by pepelu on 2015/9/9.
 */
var app = angular.module('xxnr_common');
app.service('remoteApiService', function(commonService){
    var user = commonService.user;
    this.getPointList = function(page, rows){
        var params={
            methodname:'api/v2.0/point/findPointList',
            page:page,
            rows:rows
        };
        return commonService.ajax(params);
    };

    this.addOrder = function(shoppingCartId, addressId, products, payType){
        var params = {
            'methodname':'api/v2.0/order/addOrder',
            'shopCartId':shoppingCartId,
            'addressId':addressId,
            'products':JSON.stringify(products),
            'payType':payType
        };

        return commonService.ajax(params);
    };

    this.getOrderList = function(page, type){
        var params={
            methodname:'api/v2.0/order/getOderList',
            page:page,
            typeValue:type//订单类型  所有的订单
        };
        return commonService.ajax(params);
    };

    this.getOrderDetail = function(orderId){
        var params={
            methodname:'/api/v2.0/order/getOrderDetails',
            orderId:orderId,
            userId:user.userid
        };
        return commonService.ajax(params);
    };

    this.updateOrderPaytype = function(orderId, payType){
        var params={
            methodname:'/api/v2.0/order/updateOrderPaytype',
            orderId:orderId,
            payType:payType,
            userId:user.userid
        };
        return commonService.ajax(params);
    };

    this.getCommentList = function(page, rows){
        var params={
            methodname:'app/comment/MyJudgeList',
            page:page,
            rows:rows
        };
        return commonService.ajax(params);
    };

    this.getBasicUserInfo = function(){
        var params={
            methodname:'api/v2.0/user/get'
        };
        return commonService.ajax(params);
    };

    this.getAddressList = function(){
        var params={
            methodname:'api/v2.0/user/getUserAddressList'
        };
        return commonService.ajax(params);
    };

    this.saveUserAddress = function(buildUserType, receiptPhone, receiptName, consigneeAddress, areaId, cityId, countyId, townId, zipCode){
        var params={
            methodname:'api/v2.0/user/saveUserAddress',
            type:buildUserType,
            receiptPhone:receiptPhone,
            receiptPeople:receiptName,
            address:consigneeAddress,
            areaId:areaId,
            cityId:cityId,
            countyId:countyId,
            townId:townId,
            zipCode:zipCode
        };
        return commonService.ajax(params);
    };

    this.updateUserAddress = function(addressId, areaId, address, receiptName, receiptPeople, type, cityId, countyId, townId, zipCode){
        var params={
            methodname:'api/v2.0/user/updateUserAddress',
            addressId:addressId,
            areaId:areaId,
            address:address,
            receiptPhone:receiptName,
            receiptPeople:receiptPeople,
            type:type,
            cityId:cityId,
            countyId:countyId,
            townId:townId,
            zipCode:zipCode
        };
        return commonService.ajax(params);
    };

    this.deleteUserAddress = function(addressId){
        var params = {
            'methodname':'api/v2.0/user/deleteUserAddress',
            'addressId':addressId
        };
        return commonService.ajax(params);
    };

    this.getProvinceList = function(){
        var params={
            methodname:'api/v2.0/area/getAreaList',
        };
        return commonService.ajax(params);
    };

    this.getCityList = function(provinceId){
        var params={
            methodname:'api/v2.0/businessDistrict/getBusinessByAreaId',
            areaId:provinceId
        };
        return commonService.ajax(params);
    };

    this.getCountyList = function(cityId){
        var params={
            methodname:'api/v2.0/build/getBuildByBusiness',
            businessId:cityId
        };
        return commonService.ajax(params);
    };

    this.getTownList = function(cityId,countyId){
        var params={
            methodname:'api/v2.0/area/getAreaTown',
            cityId:cityId,
            countyId:countyId
        };
        return commonService.ajax(params);
    };

    this.getShoppingCart = function(){
        var params={
            'methodname':'/api/v2.0/getShoppingCart'
        };
        return commonService.ajax(params);
    };

    this.changeCartNum = function(goodId, newCount){
        var params={
            methodname:'api/v2.0/updateShoppingCart',
            goodsId:goodId,
            quantity:newCount
        };
        return commonService.ajax(params);
    };

    this.cancleOrder = function(orderId){
        var params={
            methodname:'app/order/cancelOrder',
            orderId:orderId
        };
        return commonService.ajax(params);
    };

    this.confirmReceipt = function(orderId){
        var params = {
            'methodname':'/api/v2.0/order/confirmeOrder',
            'orderId':orderId
        };
        return commonService.ajax(params);
    };

    this.aquireService = function(orderId){
        var params = {
            'methodname':'app/order/salesReturnOrder',
            'orderId':orderId
        };
        return commonService.ajax(params);
    };

    this.uploadHeadPortrait = function(file){
        var params = {
            'methodname':'app/res/uploadHeadPortrait',
            'resFile':file
        };
        return commonService.ajax(params);
    };

    this.addAddressToOrder = function(orderId, addressId){
        var params = {
            'methodname':'app/order/addBuildingUserId',
            'orderDataId':orderId,
            'buildingUserId':addressId
        };
        return commonService.ajax(params);
    };

    this.addDeliveryTimeToOrder = function(orderId, time){
        var params = {
            'methodname':'app/order/addDeliveryTime',
            'orderDataId':orderId,
            'deliveryTime':time
        };
        return commonService.ajax(params);
    };

    this.addRemarksToOrder = function(orderId, remarks){
        var params = {
            'methodname':'app/order/addRemarksByOrderId',
            'orderDataId':orderId,
            'remarks':remarks
        };
        return commonService.ajax(params);
    };

    this.submitOrder = function(orderId){
        var params = {
            'methodname':'app/order/affirmOrder',
            'orderDataId':orderId
        };
        return commonService.ajax(params);
    };

    this.getProducts = function(page, max, categoryId){
        var params={
            methodname:'/api/v2.0/products/',
            page:page,
            max:max,
            category:categoryId
        };
        return commonService.ajax(params);
    };

    this.getProductsTabs = function(categoryId,attribute){
        var params={
            methodname:'api/v2.0/products/'+attribute,
            category:categoryId
        };
        return commonService.ajax(params);
    };

    this.isAlive = function(){
        var params= {
            methodname: '/api/v2.0/user/isAlive/'
        };
        return commonService.ajax(params);
    };
	
	this.getCategories = function(){
        var params={
            methodname:'/api/v2.0/products/categories/'
        };
		
        return commonService.ajax(params);	    
	};
    this.login = function(userName, password, keepLogin){
        var params={
            methodname:'api/v2.0/user/login',
            account:userName,
            password:password,
            keepLogin:keepLogin
        };
        return commonService.ajax(params);
    };
    this.findAccount = function(phoneNum){
        var params={
            methodname:'api/v2.0/user/findAccount',
            account:phoneNum
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
    this.modifyPassword = function(oldPassword,newPassword){
        var params ={
            "methodname":"api/v2.0/user/modifypwd",
            "oldPwd":oldPassword,
            "newPwd":newPassword
        };
        return commonService.ajax(params);
    };
    this.modifyNickname = function(nickName){
        var params ={
            "methodname":"api/v2.0/user/modify",
            "nickName":nickName
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
            'methodname':'api/v2.0/product/getProductDetails',
            'goodsId':productId
        };
        return commonService.ajax(params);
    };
    this.getGoodsListPage = function(page, rowCount, classId, brandName, modelName ,reservePrice){
        var params={
            methodname:'api/v2.0/product/getProductsListPage',
            page:page,
            rowCount:rowCount,
            classId:classId,
            brandName:brandName,
            modelName:modelName,
            reservePrice:reservePrice
        };
        return commonService.ajax(params);
    };
    
    this.addToShoppingCart = function(id, count, update_by_add){
        if(!user || !user.userid){
            window.location.href="logon.html";
           return;
        }

        var params = {
            methodname:'/api/v2.0/shopCart/addToCart',
            goodsId:id,
            count:count,
            update_by_add:update_by_add
        };
        return commonService.ajax(params);
    };

    this.getPublicKey = function(){
        var params = {
            methodname:'api/v2.0/user/getpubkey'
        };
        return commonService.ajax(params);
    };

    this.getNewsCategories = function(){
        var params = {
            methodname:'api/v2.0/news/categories'
        };
        return commonService.ajax(params);
    };

    this.getNewsList = function(category){
        var params = {
            methodname:'api/v2.0/news',
            category:category
        };
        return commonService.ajax(params);
    };

    this.getSpecificNewsList = function(category,max,page){
        var params = {
            methodname:'api/v2.0/news',
            category:category,
            max:max,
            page:page
        };
        return commonService.ajax(params);
    };

    this.getNewsBody = function(id){
        var params = {
            methodname:'api/v2.0/news/'+id
        };
        return commonService.ajax(params);
    };
    this.getInvitee = function(){
        var params = {
            methodname:'/api/v2.0/user/getInvitee',
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.bindInviter = function(inviter){
        var params = {
            methodname:'/api/v2.0/user/bindInviter',
            'inviter':inviter,
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.confirmUpload = function(filename){
        var params = {
            methodname:'api/v2.0/user/confirmUpload',
            'userId':user.userid,
            'newFile':filename
        };
        return commonService.ajax(params);
    };
});