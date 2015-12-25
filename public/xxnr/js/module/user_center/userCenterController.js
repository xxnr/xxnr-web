/**
 * Created by pepelu on 2015/9/8.
 */
var app = angular.module('user_center', ['xxnr_common']);
app.controller('userCenterController', function($scope, remoteApiService, payService){
    $scope.user = {};
    $scope.orderList = [];
    $scope.searchIndex = [];
    $scope.showTypes = [{id:-1, name:'所有订单', isSelected:true},
        {id:1, name:'待付款', isSelected:false},
        {id:2, name:'待发货', isSelected:false},
        {id:3, name:'已发货', isSelected:false}];

    remoteApiService.getPointList(1,10)
        .then(function(data){
            $scope.user.points = data.datas.pointLaterTrade;
        });

    remoteApiService.getBasicUserInfo()
        .then(function(data){
            $scope.user.phoneNumber = data.datas.phone;
            $scope.user.imgUrl = data.datas.photo;
        });

    remoteApiService.getAddressList()
        .then(function(data){
            if(data && data.datas && data.datas.rows && data.datas.rows.length){
                var contact = data.datas.rows[0];
                $scope.user.name = contact.receiptPeople;
                $scope.user.address = contact.areaName + contact.cityName + contact.countyName + contact.address;
            }
            else{
                console.warn('getAddressList failed - no available address');
            }
        });

    $scope.show = function(showTypeId, index) {
        remoteApiService.getOrderList(1, showTypeId)
            .then(function(data){
                $scope.orderList = [];
                var orders = data.items;
                $scope.searchIndex = [];
                for(var showType in $scope.showTypes){
                    $scope.showTypes[showType].isSelected = false;
                }
                $scope.showTypes[index].isSelected = true;

                for (var i=0; i<orders.length; i++ ) {
//                    if(showTypeIds != 0 && showTypeIds.indexOf(orders[i].type) == -1){
//                        continue;
//                    }

                    var order = {};

                    for(var j in orders[i]){
                        if(orders[i].hasOwnProperty(j)){
                            order[j] = orders[i][j];
                        }
                    }

                    if(orders[i].products.length==0){
                        continue;
                    }

                    order.id = orders[i].id;
                    order.orderNo = orders[i].paymentId;
                    order.totalPrice = orders[i].price||-1;
                    order.payType = orders[i].payType==1? '支付宝支付':'银联支付';
                    order.imgUrl = orders[i].products[0].thumbnail;
                    order.receiver = orders[i].consigneeName;
                    order.address = orders[i].consigneeAddress;
                    order.phone = orders[i].consigneePhone;
                    order.deliveryTime = orders[i].dateDelivered;
                    order.createTime = orders[i].dateCreated;
                    if(orders[i].payStatus == 1){
                        order.statusName = '待付款';
                        order.actionName = '立即付款';
                    }else if(orders[i].deliverStatus == 1){
                        order.statusName = '待发货';
                        order.actionName = '联系客服';
                    }else if(orders[i].confirmed){
                        order.statusName = '已发货';
                        order.actionName = '确认收货';
                    }else{
                        order.statusName = '已完成';
                        order.actionName = '联系客服';
                    }

                    console.log(JSON.stringify(order));

                    $scope.searchIndex[order.id] =$scope.orderList.push(order)-1;
                }
            });
    };

    $scope.show(0, 0);
    // add other properties of userInfo

    // private function
    var confirmReceiption = function(orderId){
        remoteApiService.confirmReceipt(orderId)
            .then(function(data){
                alert('已收货', function(){
                    window.location.reload();
                });
            });
    };

    $scope.orderAction = function(payStatus, deliverStatus, orderId) {
        if (payStatus == 1) {
            window.location.href = '#';
            $scope.showPayPop = true;
            window.open(payService.aliPayUrl(orderId));
        }
        // todo: add action for other condition
    };
    $scope.finishPay = function(){
        window.location.reload();
    };
    $scope.notFinishPay = function(){
        $scope.showPayPop = false;
    }
});