/**
 * Created by cuidi on 15/11/11.
 */

var app = angular.module('order_detail', ['xxnr_common', 'shop_cart']);
app.controller('orderDetailController', function ($scope, remoteApiService, commonService, payService, loginService) {
    var sweetalert = commonService.sweetalert;
    $scope.order = {};
    $scope.order.orderType = 0;
    $scope.more_imgUrl = "icon-down.png";
    $scope.id = commonService.getParam('id');
    $scope.subOrdersPaymentshow = [];
    $scope.subOrdersPaymentshowText = [];
    $scope.subOrdersPayments_detail_imgUrl = [];
    $scope.wholePageShow = false;

    $scope.showConfirmSKUReceivedPop = false; //确认收货的弹窗变量
    $scope.ConfirmingSKUs = [];  //要确认的收货物品列表
    $scope.ConfirmingSKUIds = [];  //要确认的收货物品id列表
    $scope.ConfirmingOrderIds;  //要确认的收货物品列表

    $scope.closePop = function() {
        $scope.isOverflow = false;
        $scope.showPop = false;
        $scope.showConfirmSKUReceivedPop = false;
    };

    remoteApiService.getOrderDetail($scope.id)
        .then(function (data) {
            if (data.code != 1000) {
//                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
            }
            else {
                $scope.wholePageShow = true;
                $scope.order.id = data.datas.rows.id;
                $scope.order.dateCreated = data.datas.rows.order.dateCreated ? convertDateIncludeHMM(data.datas.rows.order.dateCreated) : "";
                $scope.order.datePaid = data.datas.rows.order.datePaid ? convertDateIncludeHMM(data.datas.rows.order.datePaid) : "";
                $scope.order.dateDelivered = data.datas.rows.order.dateDelivered ? convertDateIncludeHMM(data.datas.rows.order.dateDelivered) : "";
                $scope.order.dateCompleted = data.datas.rows.order.dateCompleted ? convertDateIncludeHMM(data.datas.rows.order.dateCompleted) : "";
                $scope.order.orderStatus = data.datas.rows.order.orderStatus;
                $scope.order.receiver = data.datas.rows.recipientName;
                $scope.order.address = data.datas.rows.address;
                $scope.order.receiverPhone = data.datas.rows.recipientPhone;
                $scope.order.products = data.datas.rows.orderGoodsList;
                if (data.datas.rows.SKUList) {
                    if (data.datas.rows.SKUList.length > 0) {
                        $scope.order.products = data.datas.rows.SKUList;
                    }
                }
                $scope.order.deliveryType = data.datas.rows.deliveryType;
                $scope.order.deposit = data.datas.rows.deposit;
                $scope.order.totalPrice = data.datas.rows.totalPrice;
                $scope.order.payStatus = data.datas.rows.payStatus;
                $scope.order.orderType = Number(data.datas.rows.orderType);
                $scope.order.deliverStatus = Number(data.datas.rows.deliverStatus);
                $scope.order.confirmed = data.datas.rows.confirmed;
                $scope.order.duePrice = data.datas.rows.duePrice;
                $scope.order.paySubOrderType = data.datas.rows.paySubOrderType;
                $scope.subOrders = data.datas.rows.subOrders;
                $scope.RSCInfo = data.datas.rows.RSCInfo;
                $scope.recipientName = data.datas.rows.recipientName;
                $scope.recipientPhone = data.datas.rows.recipientPhone;
                if ($scope.order.orderStatus.type == 0) {
                    //$scope.order.statusName = '已关闭';
                    $scope.order.showAction = false;
                } else if ($scope.order.orderStatus.type == 1) {
                    //$scope.order.statusName = '待付款';
                    $scope.order.actionName = '支付';
                    $scope.order.action = function (order) {
                        remoteApiService.isAlive()
                            .then(function (data) {
                                if (data.code == 1000) {
                                    window.location.href = "commitPay.html?id=" + $scope.order.id;
                                }
                            });
                    }
                } else if ($scope.order.orderStatus.type == 2) {
                    $scope.order.actionName = '支付';
                    $scope.order.action = function (order) {
                        remoteApiService.isAlive()
                            .then(function (data) {
                                if (data.code == 1000) {
                                    window.location.href = "commitPay.html?id=" + $scope.order.id;
                                }
                            });
                    }
                } else if ($scope.order.orderStatus.type == 3) {
                    //$scope.order.statusName = '待发货';
                } else if ($scope.order.orderStatus.type == 4) { //配送中的订单 用户可以确认收货
                    $scope.order.actionName = '确认收货';
                    $scope.hadSKU_deliverying = false; //判断是否有可自提SKU
                    $scope.order.products.forEach(function(SKU){
                        if(SKU.deliverStatus == 2){
                            $scope.hadSKU_deliverying = true;
                        }
                    });

                    $scope.order.action = function (order) {
                        $scope.ConfirmingOrderIds = order.id;
                        $scope.ConfirmingSKUs = [];
                        $scope.ConfirmingSKUIndex = -1;
                        $scope.showConfirmSKUReceivedPop = true;
                        $scope.ConfirmingSKUIds = [];
                        $scope.isOverflow = true;
                        if ($scope.order.products) {
                            for (var i in $scope.order.products) {
                                if ($scope.order.products[i].deliverStatus == 2) {
                                    $scope.ConfirmingSKUs.push($scope.order.products[i]);
                                }
                            }
                        }
                        $scope.ConfirmingSKUs.forEach(function(ConfirmingSKU){
                            ConfirmingSKU.shortName = ConfirmingSKU.productName.length > 30 ? (ConfirmingSKU.productName.substr(0, 27) + '...') : ConfirmingSKU.productName;
                        });
                    };

                } else if ($scope.order.orderStatus.type == 5) {
                    $scope.order.actionName = '去自提';
                    remoteApiService.getDeliveryCode($scope.order.id)
                        .then(function (data) {
                            if (data.code == 1000) {
                                $scope.pickupDeliveryCode = data.deliveryCode;
                            } else {
                                sweetalert('获取提货码失败');
                            }
                        });
                } else if ($scope.order.orderStatus.type == 6) {
                    $scope.order.actionName = '联系客服';
                } else if ($scope.order.orderStatus.type == 7) {
                    $scope.order.showModifyAction = true;
                    $scope.order.actionName = '查看付款信息';
                    $scope.order.action = function () {
                        window.location.href = "commitPay.html?id=" + $scope.order.id + "&offlinePay=1";
                    };
                    $scope.order.modifyPay = function () {
                        window.location.href = "commitPay.html?id=" + $scope.order.id;
                    }
                }

                for (var i in $scope.subOrders) {
                    //console.log(i);
                    $scope.subOrdersPaymentshow.push(false);
                    $scope.subOrdersPaymentshowText.push('查看详情');
                    $scope.subOrdersPayments_detail_imgUrl.push("icon-down.png");
                    $scope.subOrders[i].paidPrice = $scope.subOrders[i].paidPrice ? $scope.subOrders[i].paidPrice : 0;

                    for (var j in $scope.subOrders[i].payments) {
                        if($scope.subOrders[i].payments.hasOwnProperty(j)) {
                            var d = Date.fromISO($scope.subOrders[i].payments[j].datePaid);
                            $scope.subOrders[i].payments[j].FormattedDatePaid = d.getFullYear().toString() + '-' + (d.getMonth() + 1).toString() + '-' + d.getDate().toString();
                        }
                    }
                    $scope.subOrders[i].showAction = true;
                    if ($scope.subOrders[i].payStatus == 1) {
                        $scope.subOrders[i].statusName = '待付款';
                    } else if ($scope.subOrders[i].payStatus == 2) {
                        $scope.subOrders[i].statusName = '已付款';
                    } else if ($scope.subOrders[i].payStatus == 3) {
                        $scope.subOrders[i].statusName = '部分付款';
                    }
                    if ($scope.order.paySubOrderType != $scope.subOrders[i].type && $scope.subOrders[i].payStatus != 2) {
                        $scope.subOrders[i].statusName = '未开始';
                        $scope.subOrders[i].showAction = false;
                    }
                }


            }
            //switch (parseInt(data.datas.rows.payType)) {
            //    case 1:
            //        $scope.order.payType = '支付宝支付';
            //        //$scope.order.payUrl = payService.aliPayUrl($scope.order.id);
            //        break;
            //    case 2:
            //        $scope.order.payType = '银联支付';
            //        //$scope.order.payUrl = payService.unionPayUrl($scope.order.id);
            //        break;
            //    case 3:
            //        $scope.order.payType = '银联支付';
            //        //$scope.order.payUrl = payService.unionPayUrl($scope.order.id);
            //        break;
            //}
        });
    $scope.payment_detaile_toggle = function (index) {
        $scope.subOrdersPaymentshow[index] = !$scope.subOrdersPaymentshow[index];
        $scope.subOrdersPaymentshowText[index] = $scope.subOrdersPaymentshow[index] ? "收起详情" : "查看详情";
        $scope.subOrdersPayments_detail_imgUrl[index] = $scope.subOrdersPaymentshow[index] ? "icon-up.png" : "icon-down.png";
        // console.log(index);
    };

    $scope.finishPay = function () {
        window.location.reload();
    };
    $scope.notFinishPay = function () {
        $scope.isOverflow = false;
        $scope.showPayPop = false;

    };
    var timeStringExtendZero = function (timeString) {
        if (timeString.length < 2) {
            return '0' + timeString;
        } else {
            return timeString;
        }
    };
    var convertDateIncludeHMM = function (dataStr) {
        var d = Date.fromISO(dataStr);
        // console.log(d);
        var output = d.getFullYear().toString() + '-' + timeStringExtendZero((d.getMonth() + 1).toString()) + '-' + timeStringExtendZero(d.getDate().toString()) + ' ' + d.getHours().toString() + ':' + timeStringExtendZero(d.getMinutes().toString()) + ':' + timeStringExtendZero(d.getSeconds().toString());
        return output;
    };
    $scope.addToConfirmingSKU_List = function(index){
        if($scope.ConfirmingSKUIds.length == 0){
            $scope.ConfirmingSKUIds.push($scope.ConfirmingSKUs[index]._id);
        }else{
            var hasExsited = false;
            for(var i in $scope.ConfirmingSKUIds){              //如果已在$scope.ConfirmingSKUs就剔除
                if($scope.ConfirmingSKUs[index]._id == $scope.ConfirmingSKUIds[i]){
                    $scope.ConfirmingSKUIds.splice(i, 1);
                    hasExsited = true;
                }
            }
            if(!hasExsited){
                $scope.ConfirmingSKUIds.push($scope.ConfirmingSKUs[index]._id); //不在时就加入$scope.ConfirmingSKUs
            }
        }
    };
    $scope.checkConfirmingSKU_List = function(index){
        if($scope.ConfirmingSKUIds.indexOf($scope.ConfirmingSKUs[index]._id )!=-1){
            return true;
        }else{
            return false;
        }
    };
    $scope.confirmSKU = function(){
        //remoteApiService.confirmSKU($scope.ConfirmingOrderIds,$scope.ConfirmingSKUIds.join())
        //    .then(function(data) {
        //        $scope.ConfirmingOrderIds = null;
        //        if(data.code == 1000){
        //            sweetalert('该商品确认收货成功',window.location.pathname);
        //        }else{
        //            sweetalert('确认收货失败',window.location.pathname);
        //        }
        //    });
        sweetalert('该商品确认收货成功',window.location.pathname+"?id="+$scope.order.id);
        //$scope.ConfirmingOrderIds = null;
    };
});
