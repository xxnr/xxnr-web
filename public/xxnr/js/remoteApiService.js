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

    this.addOrder = function(shoppingCartId, addressId, SKUs, payType, deliveryType, RSCId, consigneePhone, consigneeName){
        var data = {
            'methodname':'api/v2.1/order/addOrder',
            'shopCartId':shoppingCartId,
            'addressId':addressId,
            'SKUs':SKUs,
            'payType':payType,
            'deliveryType':deliveryType,
            'RSCId':RSCId,
            'consigneePhone':consigneePhone,
            'consigneeName':consigneeName
        };

        return commonService.sendPost(data);
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
            methodname:'api/v2.0/order/getOrderDetails',
            orderId:orderId,
            userId:user.userid
        };
        return commonService.ajax(params);
    };

    this.updateOrderPaytype = function(orderId, payType){
        var params={
            methodname:'api/v2.0/order/updateOrderPaytype',
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
            'methodname':'api/v2.1/cart/getShoppingCart'
        };
        return commonService.ajax(params);
    };

    this.changeCartNum = function(SKU_id, newCount){
        var data={
            'methodname':'api/v2.1/cart/changeNum',
            'SKUId':SKU_id,
            'quantity':newCount
        };
        return commonService.sendPost(data);
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
            'methodname':'api/v2.0/order/confirmeOrder',
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
            methodname:'api/v2.1/products/',
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
    this.getBrands = function(categoryId){
        var params={
            methodname:'api/v2.1/brands/',
            category:categoryId
        };

        return commonService.ajax(params);
	};
    this.getAttributes = function(categoryId,brand){
        var params={
            methodname:'api/v2.1/products/attributes',
            category:categoryId,
            brand:brand
        };
        return commonService.ajax(params);
	};
    this.isAlive = function(){
        var params= {
            methodname: 'api/v2.0/user/isAlive/'
        };
        return commonService.ajax(params);
    };

	this.getCategories = function(){
        var params={
            methodname:'api/v2.0/products/categories/'
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
    this.getGoodsListPage = function(page, rowCount, classId, brand, queryAttributesArray ,reservePrice){
        // console.log(queryAttributesArray);
        var data={
            'methodname':'api/v2.1/product/getProductsListPage',
            'page':page,
            'rowCount':rowCount,
            'classId':classId,
            'brand':brand,
            'attributes':queryAttributesArray,
            'reservePrice':reservePrice
        };
        return commonService.sendPost(data);
    };
    this.querySKU = function(product_id,attributes){
        var data={
            'methodname':'api/v2.1/SKU/attributes_and_price/query',
            'product':product_id,
            'attributes':attributes
        };
        return commonService.sendPost(data);
    };
    this.addToShoppingCart = function(id, count, additions, update_by_add){
        if(!user || !user.userid){
            window.location.href="logon.html";
           return;
        }

        var data = {
            'methodname':'api/v2.1/cart/addToCart',
            'SKUId':id,
            'count':count,
            'additions':additions,
            'update_by_add':update_by_add
        };
        return commonService.sendPost(data);
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
            methodname:'api/v2.0/user/getInvitee',
            'userId':user.userid
        };
        return commonService.ajax(params);
    };

    this.bindInviter = function(inviter){
        var params = {
            methodname:'api/v2.0/user/bindInviter',
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

    this.userTypeList = function(){
        var params = {
            methodname:'api/v2.0/usertypes'
        };
        return commonService.ajax(params);
    };

    this.getInviteeOrders = function(inviteeId,page,max){
        var params = {
            methodname:'api/v2.0/user/getInviteeOrders',
            'inviteeId':inviteeId,
            'page':page,
            'max':max
        };
        return commonService.ajax(params);

    };
    this.isInWhiteList = function(){
        var params = {
            methodname:'api/v2.0/user/isInWhiteList'
        };
        return commonService.ajax(params);
    };
    this.getNominatedInviter = function(){
        var params = {
            methodname:'api/v2.1/user/getNominatedInviter'
        };
        return commonService.ajax(params);
    };
    this.fillRSCinfo = function(name,IDNo,companyName,companyAddress,phone){
        var data={
            'methodname':'api/v2.2/RSC/info/fill',
            'name':name,
            'IDNo':IDNo,
            'companyName':companyName,
            'companyAddress':companyAddress,
            'phone':phone
        };
        return commonService.sendPost(data);
    };
    this.getRSCinfo = function(){
        var params = {
            methodname:'api/v2.2/RSC/info/get',
        };
        return commonService.ajax(params);
    };
    this.getDeliveries = function(SKUs){
        var data={
            'methodname':'api/v2.2/cart/getDeliveries',
            'userId':user.userid,
            'SKUs':SKUs
        };
        return commonService.sendPost(data);
    };
    this.RSCAddressProvince = function(products){
        var params = {
            'methodname':'api/v2.2/RSC/address/province',
            'products':products
        };
        return commonService.ajax(params);
    };
    this.RSCAddressCity = function(products,provinceId){
        var params = {
            'methodname':'api/v2.2/RSC/address/city',
            'products':products,
            'province':provinceId
        };
        return commonService.ajax(params);
    };

    this.RSCAddressCounty = function(products,provinceId,cityId){
        var params = {
            'methodname':'api/v2.2/RSC/address/county',
            'products':products,
            'province':provinceId,
            'city':cityId
        };
        return commonService.ajax(params);
    };
    this.getRSC = function(products,province,city,county,town,page,max){
        var params = {
            'methodname':'api/v2.2/RSC',
            'products':products,
            'province':province,
            'city':city,
            'county':county,
            'town':town,
            'page':page,
            'max':max
        };
        return commonService.ajax(params);
    };
    this.saveConsignees = function(consigneeName,consigneePhone){
        var data={
            'methodname':'api/v2.2/user/saveConsignees',
            'userId':user.userid,
            'consigneeName':consigneeName,
            'consigneePhone':consigneePhone
        };
        return commonService.sendPost(data);
    };
    this.queryConsignees = function(){
        var params = {
            'methodname':'api/v2.2/user/queryConsignees',
            'userId':user.userid
        };
        return commonService.ajax(params);
    };
    this.offlinepay = function(orderId,price){
        var params = {
            'methodname':'offlinepay',
            'orderId':orderId,
            'price':price
        };
        return commonService.ajax(params);
    };


    this.confirmSKU = function(orderId,SKURefs){
        var data={
            'methodname':'api/v2.2/order/confirmSKUReceived',
            'orderId':orderId,
            'SKURefs':SKURefs
        };
        return commonService.sendPost(data);
    };
    this.getDeliveryCode = function(orderId){
        var params = {
            'methodname':'api/v2.2/order/getDeliveryCode',
            'orderId':orderId
        };
        return commonService.ajax(params);
    };

});
