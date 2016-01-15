/**
 * Created by cuidi on 15/11/11.
 */

var app=angular.module('order_detail', ['xxnr_common','shop_cart']);
app.controller('orderDetailController',function($scope, remoteApiService, commonService, payService, loginService){
    var sweetalert = commonService.sweetalert;
    $scope.order = {};
    $scope.order.orderType = 0;
    $scope.more_imgUrl = "icon-down.png";
    $scope.id = commonService.getParam('id');
    $scope.subOrdersPaymentshow = [];
    $scope.subOrdersPaymentshowText = [];
    $scope.subOrdersPayments_detail_imgUrl = [];
    $scope.wholePageShow = false;
    remoteApiService.getOrderDetail($scope.id)
        .then(function(data){
            if(data.code!=1000){
//                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
            }
            else{
                $scope.wholePageShow = true;
                $scope.order.id = data.datas.rows.id;
                $scope.order.dateCreated = data.datas.rows.order.dateCreated?convertDateIncludeHMM(data.datas.rows.order.dateCreated):"";
                $scope.order.datePaid = data.datas.rows.order.datePaid?convertDateIncludeHMM(data.datas.rows.order.datePaid):"";
                $scope.order.dateDelivered = data.datas.rows.order.dateDelivered?convertDateIncludeHMM(data.datas.rows.order.dateDelivered):"";
                $scope.order.dateCompleted = data.datas.rows.order.dateCompleted?convertDateIncludeHMM(data.datas.rows.order.dateCompleted):"";
                $scope.order.orderStatus = data.datas.rows.order.orderStatus;
                $scope.order.receiver =  data.datas.rows.recipientName;
                $scope.order.address = data.datas.rows.address;
                $scope.order.receiverPhone = data.datas.rows.recipientPhone;
                $scope.order.products = data.datas.rows.orderGoodsList;
                $scope.order.deposit = data.datas.rows.deposit;
                $scope.order.totalPrice = data.datas.rows.totalPrice;
                $scope.order.payStatus = data.datas.rows.payStatus;
                $scope.order.orderType = Number(data.datas.rows.orderType);
                $scope.order.deliverStatus = Number(data.datas.rows.deliverStatus);
                $scope.order.confirmed = data.datas.rows.confirmed;
                $scope.order.duePrice = data.datas.rows.duePrice;
                $scope.order.paySubOrderType = data.datas.rows.paySubOrderType;
                $scope.subOrders = data.datas.rows.subOrders;
                for(var i in $scope.subOrders){
                    $scope.subOrdersPaymentshow.push(false);
                    $scope.subOrdersPaymentshowText.push('查看详情');
                    $scope.subOrdersPayments_detail_imgUrl.push("icon-down.png");
                    $scope.subOrders[i].paidPrice = $scope.subOrders[i].paidPrice?$scope.subOrders[i].paidPrice:0;
                    for(var j in $scope.subOrders[i].payments){
                        var d = Date.fromISO($scope.subOrders[i].payments[j].datePaid);
                        $scope.subOrders[i].payments[j].FormattedDatePaid = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString();
                    }
                    if($scope.order.orderStatus.type == 0){
                        $scope.subOrders[i].statusName = '已关闭';
                        $scope.subOrders[i].showAction = false;
                    }else{
                        if($scope.subOrders[i].payStatus == 1) {
                            $scope.subOrders[i].statusName = '待付款';
                            $scope.subOrders[i].actionName = '支付';
                            $scope.subOrders[i].showAction = true;
                            $scope.subOrders[i].action = function (order) {
                                remoteApiService.isAlive()
                                    .then(function (data) {
                                        if (data.code == 1000) {
                                            window.location.href = "commitPay.html?id=" + $scope.order.id;
                                        }
                                    });
                            }
                        }else if($scope.subOrders[i].payStatus == 2){
                            $scope.subOrders[i].statusName = '已付款';
                            $scope.subOrders[i].actionName = '联系客服';
                            $scope.subOrders[i].showAction = false;
                        }else if($scope.subOrders[i].payStatus == 3){
                            $scope.subOrders[i].statusName = '部分付款';
                            $scope.subOrders[i].actionName = '支付';
                            $scope.subOrders[i].showAction = true;
                            $scope.subOrders[i].action = function (order) {
                                remoteApiService.isAlive()
                                    .then(function (data) {
                                        if (data.code == 1000) {
                                            window.location.href = "commitPay.html?id=" + $scope.order.id;
                                        }
                                    });
                            }
                        }
                        // console.log($scope.order.paySubOrderType);
                        // console.log($scope.subOrders[i].type);
                        if($scope.order.paySubOrderType != $scope.subOrders[i].type && $scope.subOrders[i].payStatus != 2){
                            $scope.subOrders[i].statusName = '未开始';
                            $scope.subOrders[i].showAction = false;
                        }
                    }
                }
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
            }
        });
    $scope.payment_detaile_toggle = function(index){
        $scope.subOrdersPaymentshow[index] = !$scope.subOrdersPaymentshow[index];
        $scope.subOrdersPaymentshowText[index] = $scope.subOrdersPaymentshow[index]?"收起详情":"查看详情";
        $scope.subOrdersPayments_detail_imgUrl[index] = $scope.subOrdersPaymentshow[index]?"icon-up.png":"icon-down.png";
        // console.log(index);
    };

    $scope.finishPay = function(){
        window.location.reload();
    };
    $scope.notFinishPay = function(){
        $scope.isOverflow = false;
        $scope.showPayPop = false;

    };
    var timeStringExtendZero = function(timeString){
        if(timeString.length < 2){
            return '0'+timeString;
        }else{
            return timeString;
        }
    };
    var convertDateIncludeHMM = function(dataStr){
        var d = Date.fromISO(dataStr);
        // console.log(d);
        var output = d.getFullYear().toString()+'-'+ timeStringExtendZero((d.getMonth()+1).toString()) +'-'+timeStringExtendZero(d.getDate().toString())+' '+d.getHours().toString()+':'+timeStringExtendZero(d.getMinutes().toString())+':'+ timeStringExtendZero(d.getSeconds().toString());
        return output;
    };
});
