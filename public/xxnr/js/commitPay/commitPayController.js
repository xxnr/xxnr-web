/**
 * Created by cuidi on 15/11/16.
 */
var app = angular.module('commit_pay', ['xxnr_common', 'shop_cart']);
app.controller('commitPayController', function($scope, remoteApiService, payService, commonService, loginService){
    $scope.has_offlinePay_company = false; //用来表示线下支付点的参数
    $scope.offlineSubmitted = false;   // 已提交线下订单
    // if not login
    if(!loginService.isLogin) {
        window.location.href = "logon.html";
    }
    var sweetalert = commonService.sweetalert;
    $scope.isInWhiteList = false;
    $scope.wholePageShow = false;  //用来解决angular ng-show 闪动的变量
    $scope.orderSelectedNum = 0;
    $scope.payMethods =
    [
        {imgUrl:'images/alipay.png',payUrl:payService.aliPayUrl,payType:1},
        {imgUrl:'images/unionpay.png',payUrl:payService.unionPayUrl, payType:2}
    ]; //image file name array
    $scope.payTimes = 0;
    $scope.multi_pay_text_editing = false;
    $scope.multi_pay_edit_bth = "修改";
    $scope.more_toggle = false;
    $scope.more_text = "更多支付方式";
    $scope.orders = [];
    $scope.more_imgUrl = "pay_times_more_down.png";
    $scope.ids = [];
    $scope.ids = getQueryParams('id');
    // $scope.ids = $scope.ids.concat($location.search()['id']);
    // $scope.id = commonService.getParam('id');


    $scope.itemClicked = function (index) {
        $scope.selectedPayMethodIndex = index;
    };
    $scope.orderClicked = function ($index) {
        $scope.orderSelectedNum = $index;
        $scope.multi_pay_amount = $scope.orders[$index].duePrice>3000?3000:$scope.orders[$index].duePrice;
        $scope.payTimes = 0;
        $scope.more_toggle = false;
        $scope.more_text = "更多支付方式";
        $scope.more_imgUrl = "pay_times_more_down.png";
        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].duePrice;
        // $scope.multi_pay_text_editing = false;
    };
    $scope.changePayTimes = function (index) {
        $scope.payTimes = index;
        // console.log(index);
        if(index==0){
            $scope.pay_price = $scope.orders[$scope.orderSelectedNum].duePrice;
            if($scope.selectedPayMethodIndex==0){
                $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id);
            }else if($scope.selectedPayMethodIndex==1){
                $scope.payUrl = payService.unionPayUrl($scope.orders[$scope.orderSelectedNum].id);
            }
        }else if (index==1) {
            $scope.pay_price = Number($scope.multi_pay_amount).toFixed(2);
            if($scope.selectedPayMethodIndex==0){
                $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
            }else if($scope.selectedPayMethodIndex==1){
                $scope.payUrl = payService.unionPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
            }
        }

    };
    $scope.pay_times_toggle = function () {
        $scope.more_toggle = !$scope.more_toggle;
        $scope.payTimes = $scope.more_toggle?$scope.payTimes:0;
        $scope.more_text = $scope.more_toggle?"收起支付方式":"更多支付方式";
        $scope.more_imgUrl = $scope.more_toggle?"pay_times_more.png":"pay_times_more_down.png";
        // $scope.multi_pay_text_editing = false;
        $scope.amount_reduce_editable = false;
        $scope.amount_add_editable = false;
        // $scope.multi_pay_edit_bth = "修改";
        $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].duePrice>3000?3000:$scope.orders[$scope.orderSelectedNum].duePrice;
        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].duePrice;
        if($scope.orders[$scope.orderSelectedNum].duePrice > $scope.multi_pay_amount ){
            $scope.amount_add_editable = true;
        };
    };

    $scope.edit_multi_pay_num = function () {
        $scope.pay_price = $scope.multi_pay_amount;
        payUrlSetting();
    };

    $scope.multi_pay_amount_reduce = function(){
        // if($scope.multi_pay_text_editing && (Number($scope.multi_pay_amount) - 500) >= 3000){
        if($scope.payTimes == 1){
            if((Number($scope.multi_pay_amount) - 500) >= 3000){
                $scope.multi_pay_amount = (Number($scope.multi_pay_amount) - 500).toFixed(2);
                $scope.pay_price = $scope.multi_pay_amount;
                payUrlSetting();
                if($scope.multi_pay_amount == 3000){
                    $scope.amount_reduce_editable = false;
                }
                if($scope.multi_pay_amount > 3000){
                    $scope.amount_reduce_editable = true;
                }
                if($scope.multi_pay_amount < Number($scope.orders[$scope.orderSelectedNum].duePrice)){
                    $scope.amount_add_editable = true;
                }
            }else if (Number($scope.multi_pay_amount) - 500 < 3000 && $scope.multi_pay_amount != $scope.orders[$scope.orderSelectedNum].duePrice) {
                $scope.amount_reduce_editable = false;
                $scope.multi_pay_amount = 3000;
                $scope.pay_price = $scope.multi_pay_amount;
            }
        }
    };
    $scope.multi_pay_amount_add = function(){
        // if($scope.multi_pay_text_editing && (Number($scope.multi_pay_amount) + 500) <= $scope.orders[$scope.orderSelectedNum].deposit){
        if($scope.payTimes == 1){
            if((Number($scope.multi_pay_amount) + 500) <= $scope.orders[$scope.orderSelectedNum].duePrice){
                $scope.multi_pay_amount = (Number($scope.multi_pay_amount) + 500).toFixed(2);
                $scope.pay_price = $scope.multi_pay_amount;
                payUrlSetting();
                if($scope.multi_pay_amount == $scope.orders[$scope.orderSelectedNum].duePrice){
                    $scope.amount_add_editable = false;
                }
                if($scope.multi_pay_amount > 3000){
                    $scope.amount_reduce_editable = true;
                }
                if($scope.multi_pay_amount < Number($scope.orders[$scope.orderSelectedNum].duePrice)){
                    $scope.amount_add_editable = true;
                }
            }else if (Number($scope.multi_pay_amount) + 500 > $scope.orders[$scope.orderSelectedNum].duePrice && $scope.multi_pay_amount != $scope.orders[$scope.orderSelectedNum].duePrice) {
                $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].duePrice;
                $scope.pay_price = $scope.multi_pay_amount;
                $scope.amount_add_editable = false;
            }
        }
    };

    remoteApiService.isInWhiteList()
        .then(function(data) {
            if(data.message=='true'){
                $scope.isInWhiteList = true;
            }
        });
    for(var index in $scope.ids){
        (function(index){
            remoteApiService.getOrderDetail($scope.ids[index])
                .then(function(data) {
                    if (data.code != 1000) {
        //                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
                    }
                    else {
                        $scope.wholePageShow = true;
                        $scope.orders[index] = {};
                        $scope.orders[index].id = data.datas.rows.id;
                        $scope.orders[index].subOrders = data.datas.rows.subOrders;
                        $scope.orders[index].paySubOrderType = data.datas.rows.paySubOrderType;
                        if($scope.orders[index].paySubOrderType == 'deposit'){
                            $scope.orders[index].orderType = '阶段一：订金'
                        }else if($scope.orders[index].paySubOrderType == 'balance'){
                            $scope.orders[index].orderType = '阶段二：尾款'
                        }else if($scope.orders[index].paySubOrderType == 'full'){
                            $scope.orders[index].orderType = '订单总额';
                        }
                        if(data.datas.rows.RSCInfo){
                            $scope.has_offlinePay_company = true;
                            $scope.orders[index].RSCInfo = data.datas.rows.RSCInfo;
                        }

                        $scope.orders[index].duePrice = data.datas.rows.duePrice;
                        $scope.orders[index].totalPrice = data.datas.rows.totalPrice;
                        $scope.orders[index].receiver = data.datas.rows.recipientName;
                        $scope.orders[index].address = data.datas.rows.address;
                        $scope.orders[index].receiverPhone = data.datas.rows.recipientPhone;
                        $scope.orders[index].products = data.datas.rows.orderGoodsList;
                        $scope.selectedPayMethodIndex = data.datas.rows.payType - 1;
                        $scope.orders[index].resultStr = "";
                        for(var i=0;i<$scope.orders[index].products.length;i++){
                            $scope.orders[index].resultStr +=  $scope.orders[index].products[i].goodsName + " -" + $scope.orders[index].products[i].goodsCount + "件，";
                        }
                        $scope.orders[index].resultStr = $scope.orders[index].resultStr.substr(0,$scope.orders[index].resultStr.length-1);
                        $scope.orders[index].resultStr = $scope.orders[index].resultStr.length > 100 ? ($scope.orders[index].resultStr.substr(0, 100) + '...') : $scope.orders[index].resultStr;
                        $scope.orders[index].payUrl = payService.aliPayUrl($scope.orders[index].id);

                        $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].duePrice>3000?3000:$scope.orders[$scope.orderSelectedNum].duePrice;
                        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].duePrice;
                        $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id);
                    }
                });
        })(index);
    }


    $scope.$watch('selectedPayMethodIndex',function(newValue, oldValue){
        if ( newValue !== oldValue ) {
            if($scope.selectedPayMethodIndex==0){
                $scope.payType = '支付宝支付';
                if($scope.orders[$scope.orderSelectedNum]){
                    if($scope.payTimes==0){
                        $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id);
                    }else if($scope.payTimes==1){
                        $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
                    }
                }

            }else if($scope.selectedPayMethodIndex==1){
                $scope.payType = '银联支付';
                if($scope.orders[$scope.orderSelectedNum]){
                    if($scope.payTimes==0){
                        $scope.payUrl = payService.unionPayUrl($scope.orders[$scope.orderSelectedNum].id);
                    }else if($scope.payTimes==1){
                        $scope.payUrl = payService.unionPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
                    }
                }
            }else if($scope.selectedPayMethodIndex==2){
                $scope.payType = '线下支付';
            }
            //if($scope.selectedPayMethodIndex!==null){
            //    if($scope.orders[$scope.orderSelectedNum]){
            //        remoteApiService.updateOrderPaytype($scope.orders[$scope.orderSelectedNum].id,$scope.selectedPayMethodIndex+1)
            //            .then(function(data) {
            //            });
            //    }
            //}
        }

    });

    $scope.pay = function(){
        remoteApiService.isAlive()
            .then(function(data){
                if(data.code == 1000){
                    if($scope.selectedPayMethodIndex == 2){
                        remoteApiService.offlinepay($scope.orders[$scope.orderSelectedNum].id,$scope.orders[$scope.orderSelectedNum].duePrice)
                            .then(function(data) {
                                if(data.code==1000){
                                    window.scrollTo(0,0);
                                    $scope.offlineSubmitted = true;

                                }else{
                                    sweetalert('线下支付申请失败,请重试');
                                }
                            });
                        //$scope.offlineSubmitted = true;
                    }else {
                        window.open($scope.payUrl);
                        $scope.showPayPop = true;
                        $scope.isOverflow = true;
                    }

                }
            });
    };
    $scope.finishPay = function(){
        window.location.href='my_xxnr.html';
    };
    $scope.notFinishPay = function(){
        window.location.href='my_xxnr.html';
    };

    function getQueryParams(name) {
        qs = location.search;
        var params = [];
        var tokens;
        var re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs))
        {
            if (decodeURIComponent(tokens[1]) == name)
            params.push(decodeURIComponent(tokens[2]));
        }
        return params;
    };
    function payUrlSetting(){
        if($scope.selectedPayMethodIndex==0){
            $scope.payUrl = payService.aliPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
        }else if($scope.selectedPayMethodIndex==1){
            $scope.payUrl = payService.unionPayUrl($scope.orders[$scope.orderSelectedNum].id,$scope.pay_price);
        }
    };
});
