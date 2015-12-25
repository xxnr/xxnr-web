/**
 * Created by cuidi on 15/11/16.
 */

/**
 * Created by pepelu on 9/15/2015.
 */
var app = angular.module('commit_pay', ['xxnr_common', 'shop_cart']);
app.controller('commitPayController', function($scope, remoteApiService, payService, commonService, loginService){
    // if not login
    if(!loginService.isLogin) {
        window.location.href = "logon.html";
    }
    var sweetalert = commonService.sweetalert;

    $scope.payMethods = [{imgUrl:'images/alipay.png',payUrl:payService.aliPayUrl,payType:1},
        {imgUrl:'images/unionpay.png',payUrl:payService.unionPayUrl, payType:2}]; //image file name array

    //$scope.order.payUrl = payService.aliPayUrl($scope.order.id);
    $scope.itemClicked = function ($index) {
        $scope.selectedPayMethodIndex = $index;
    };

    $scope.order = {};
    $scope.order.resultStr = "";

    $scope.id = commonService.getParam('id');

    remoteApiService.getOrderDetail($scope.id)
        .then(function(data) {
            if (data.code != 1000) {
//                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
            }
            else {
                $scope.order.id = data.datas.rows.id;
                $scope.order.deposit = data.datas.rows.deposit;
                $scope.order.receiver = data.datas.rows.recipientName;
                $scope.order.address = data.datas.rows.address;
                $scope.order.receiverPhone = data.datas.rows.recipientPhone;
                $scope.order.products = data.datas.rows.orderGoodsList;
                $scope.selectedPayMethodIndex = data.datas.rows.payType - 1;
                for(var i=0;i<$scope.order.products.length;i++){
                    $scope.order.resultStr +=  $scope.order.products[i].goodsName + " -" + $scope.order.products[i].goodsCount + "件，";
                }
                $scope.order.resultStr = $scope.order.resultStr.substr(0,$scope.order.resultStr.length-1);
                $scope.order.resultStr = $scope.order.resultStr.length > 100 ? ($scope.order.resultStr.substr(0, 100) + '...') : $scope.order.resultStr;
                $scope.order.payUrl = payService.aliPayUrl($scope.order.id);
            }
        });

    $scope.$watch('selectedPayMethodIndex',function(){
        if($scope.selectedPayMethodIndex==0){
            $scope.order.payType = '支付宝支付';
            $scope.order.payUrl = payService.aliPayUrl($scope.order.id);

        }else if($scope.selectedPayMethodIndex==1){
            $scope.order.payType = '银联支付';
            $scope.order.payUrl = payService.unionPayUrl($scope.order.id);
        }
        if($scope.selectedPayMethodIndex!==null){
            remoteApiService.updateOrderPaytype($scope.order.id,$scope.selectedPayMethodIndex+1)
                .then(function(data) {
                });
        }

    });

    $scope.pay = function(){
        remoteApiService.isAlive()
            .then(function(data){
                if(data.code == 1000){
                    $scope.showPayPop = true;
                    $scope.isOverflow = true;
                    window.open($scope.order.payUrl);
                }
            });
    };
    $scope.finishPay = function(){
        window.location.href='my_xxnr.html';
    };
    $scope.notFinishPay = function(){
        window.location.href='my_xxnr.html';
    };


});