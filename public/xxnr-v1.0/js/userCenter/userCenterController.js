/**
 * Created by pepelu on 2015/9/8.
 */
var app = angular.module('xxnr');
app.controller('userCenterController', function($scope, remoteApiService, payService){
    $scope.user = {};
    $scope.orderList = [];
    $scope.searchIndex = [];
    $scope.showTypes = [{ids:[1,2,3,4,5,6,7,8,9], name:'所有订单', isSelected:true},
        {ids:[1], name:'待付款', isSelected:false},
        {ids:[2,3,4,5,6,9], name:'待发货', isSelected:false},
        {ids:[7], name:'已完成', isSelected:false}];

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
            $scope.user.name = data.datas.rows[0].receiptPeople;
            $scope.user.address = data.datas.rows[0].address;

        });

    $scope.show = function(showTypeIds, index) {
        remoteApiService.getOrderList(1)
            .then(function(orders){
                $scope.orderList = [];
                $scope.searchIndex = [];
                for(var showType in $scope.showTypes){
                    $scope.showTypes[showType].isSelected = false;
                }
                $scope.showTypes[index].isSelected = true;
              
                for (var i=0; i<orders.length; i++ ) {
                    if(showTypeIds != 0 && showTypeIds.indexOf(orders[i].type) == -1){
                        continue;
                    }

                    var order = {};

                    for(var j in orders[i]){
                        if(orders[i].hasOwnProperty(j)){
                            order[j] = orders[i][j];
                        }
                    }

                    order.id = orders[i].id;
                    order.orderNo = orders[i].paymentId;
                    order.totalPrice = orders[i].totalPrice||-1;
                    order.typeValue = orders[i].type || 1;
                    order.payType = orders[i].payType;
                    switch (order.typeValue) {
                        case '1':
                        case 1:
                            order.statusName = '待付款';
                            order.actionName = '立即付款';
                            order.payType = '未付款';
                            break;
                        case '2':
                        case '3':
                            order.statusName = '待发货';
                            order.actionName = '联系客服';
                            break;
                        case '4':
                        case '9':
                            order.statusName = '待收货';
                            order.actionName = '确认收货';
                            break;
                        case '5':
                            order.statusName = '配送中';
                            order.actionName = '联系客服';
                            break;
                        case '6':
                            order.statusName = '已收货';
                            order.actionName = '联系客服';
                            break;
                        case '7':
                            order.statusName = '已完成';
                            order.actionName = '联系客服';
                            break;
                        case '8':
                            order.statusName = '已受理';
                            order.actionName = '联系客服';
                            break;
                    }

                    console.log(JSON.stringify(order));

                    $scope.searchIndex[order.id] =$scope.orderList.push(order)-1;
                   /* function(order){
                            var orderIndex = order.id;
                            $scope.orderList[$scope.searchIndex[orderIndex]].receiver = order.recipientName;
                            $scope.orderList[$scope.searchIndex[orderIndex]].address = order.address;
                            $scope.orderList[$scope.searchIndex[orderIndex]].deliveryTime = order.deliveryTime;
                    }(order);*/
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

    $scope.orderAction = function(orderType, orderId){
        switch(orderType){
            case '1':
                window.location.href = '#';
                $scope.showPayPop=true;
                window.open(payService.aliPayUrl(orderId));
                break;
            case '4': case '9':
                confirmReceiption(orderId);
                break;
            default:
                window.location.href = "#footer";
                break;
        }
    };
    $scope.finishPay = function(){
        window.location.reload();
    };
    $scope.notFinishPay = function(){
        $scope.showPayPop = false;
    }
});