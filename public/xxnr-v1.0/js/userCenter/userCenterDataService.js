/**
 * Created by pepelu on 2015/9/10.
 */
var app = angular.module('xxnr');
app.service('userCenterDataService',function(remoteApiService){
    var _userInfo = {};
    var _orderListByPage = [];
    var _pointListByPage = [];
    var _commentListByPage = [];

    var pointList = remoteApiService.getPointList(1,10)
        .then(function(data){
            _userInfo.points = data.datas.pointLaterTrade;
        });
    var userBasicUserInfo = remoteApiService.getBasicUserInfo()
        .then(function(data){
            _userInfo.phoneNumber = data.datas.phone;
            _userInfo.imgUrl = data.datas.photo;
        });
    var userAddressList = remoteApiService.getAddressList()
        .then(function(data){
            _userInfo.name = data.datas.rows[0].receiptPeople;
            _userInfo.address = data.datas.rows[0].address;

        });
    var orderList = remoteApiService.getOrderList(1)
        .then(function(data){
            var rawList = data.datas.rows;
            var orderList = [];
            for(var i in rawList){
                var order = {};
                order.id = rawList[i].orderId;
                order.totalPrice = rawList[i].totalPrice;
                order.statusType = rawList[i].typeValue;
                orderList[i] = order;
            }

            _orderListByPage[1] = orderList;
        });

    this.getUserInfo = function(){
        return _userInfo;
    };

    this.getOrderList = function(page){
        return _orderListByPage[page];
    }
});