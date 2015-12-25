/**
 * Created by cuidi on 15/11/11.
 */

var app=angular.module('order_detail', ['xxnr_common','shop_cart']);
app.controller('orderDetailController',function($scope, remoteApiService, commonService, payService, loginService){
    var sweetalert = commonService.sweetalert;
    $scope.order = {};
    $scope.order.orderType = 0;
    $scope.id = commonService.getParam('id');

    remoteApiService.getOrderDetail($scope.id)
        .then(function(data){
            if(data.code!=1000){
//                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
            }
            else{
                $scope.order.id = data.datas.rows.id;
                $scope.order.receiver =  data.datas.rows.recipientName;
                $scope.order.address = data.datas.rows.address;
                $scope.order.receiverPhone = data.datas.rows.recipientPhone;
                $scope.order.products = data.datas.rows.orderGoodsList;
                $scope.order.deposit = data.datas.rows.deposit;
                $scope.order.payStatus = data.datas.rows.payStatus;
                $scope.order.orderType = Number(data.datas.rows.orderType);
                $scope.order.deliverStatus = Number(data.datas.rows.deliverStatus);
                $scope.order.confirmed = data.datas.rows.confirmed;

                //$scope.order.orderType = 1;
                switch(parseInt(data.datas.rows.payType)){
                    case 1:
                        $scope.order.payType = '支付宝支付';
                        //$scope.order.payUrl = payService.aliPayUrl($scope.order.id);
                        break;
                    case 2:
                        $scope.order.payType = '银联支付';
                        //$scope.order.payUrl = payService.unionPayUrl($scope.order.id);
                        break;
                }
                //$scope.order.payStatus = 1;
                //$scope.order.deliverStatus = 2;
                if($scope.order.orderType == 1) {
                    $scope.order.statusName = '等待付款';
                    $scope.order.actionName = '支付';
                    $scope.order.statusText = '尊敬的客户，我们还未收到该订单的款项，请您尽快完成付款';
                    $scope.order.showAction = true;
                    $scope.order.action = function (order) {
                        remoteApiService.isAlive()
                            .then(function (data) {
                                if (data.code == 1000) {
                                    //window.location.href = '';
                                    //$scope.showPayPop = true;
                                    //$scope.isOverflow = true;
                                    //window.open($scope.order.payUrl);
                                    //window.open("commitPay.html?id=" + $scope.order.id);
                                    window.location.href = "commitPay.html?id=" + $scope.order.id;
                                }
                            });
                    }
                }else if($scope.order.orderType == 2){
                    $scope.order.statusName = '待发货';
                    $scope.order.actionName = '联系客服';
                    $scope.order.statusText = '尊敬的客户，您的订单已支付完成，请耐心等待卖家发货，如有问题可拨打客服电话联系我们';
                    $scope.order.showAction = false;
                }else if($scope.order.orderType == 3){
                    $scope.order.statusName = '已发货';
                    $scope.order.actionName = '确认收货';
                    $scope.order.statusText = '尊敬的客户，您的订单商品已发货，请您做好收货准备。';
                    $scope.order.showAction = false;
                    $scope.order.action = function(order){
                        if(confirm('确认收货')) {
                            //remoteApiService.confirmReceipt($scope.order.id)
                            //    .then(function (data) {
                            //        sweetalert("确认订单成功");
                            //        window.location.reload();
                            //    })
                        }
                    }
                } else if($scope.order.orderType == 0) {
                    $scope.order.showAction = false;
                    $scope.order.statusName = '已关闭';
                    $scope.order.actionName = '联系客服';
                    $scope.order.statusText = '尊敬的客户，您的订单已关闭，如有问题可拨打客服电话联系我们';
                } else if($scope.order.orderType == 4) {
                    $scope.order.showAction = false;
                    $scope.order.statusName = '已完成';
                    $scope.order.actionName = '联系客服';
                    $scope.order.statusText = '尊敬的客户，您的订单商品已完成收货，如有问题可拨打客服电话联系我们';
                }
            }
        });
    $scope.finishPay = function(){
        window.location.reload();
    };
    $scope.notFinishPay = function(){
        $scope.isOverflow = false;
        $scope.showPayPop = false;

    };
});
