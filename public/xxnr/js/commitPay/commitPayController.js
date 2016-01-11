/**
 * Created by cuidi on 15/11/16.
 */
var app = angular.module('commit_pay', ['xxnr_common', 'shop_cart']);
app.controller('commitPayController', function($scope, remoteApiService, payService, commonService, loginService){
    // if not login
    if(!loginService.isLogin) {
        window.location.href = "logon.html";
    }
    var sweetalert = commonService.sweetalert;
    $scope.orderSelectedNum = 0;
    $scope.payMethods = [{imgUrl:'images/alipay.png',payUrl:payService.aliPayUrl,payType:1},
        {imgUrl:'images/unionpay.png',payUrl:payService.unionPayUrl, payType:2}]; //image file name array
    $scope.payTimes = 0;
    // $scope.multi_pay_text_editing = false;
    $scope.multi_pay_edit_bth = "修改";
    $scope.more_toggle = false;
    $scope.more_text = "更多支付方式";
    $scope.orders = [];
    $scope.more_imgUrl = "pay_times_more_down.png";
    // $scope.id = commonService.getParam('id');
    $scope.ids = [];
    // $scope.ids = $scope.ids.concat($location.search()['id']);
    $scope.ids = getQueryParams('id');

    $scope.itemClicked = function ($index) {
        $scope.selectedPayMethodIndex = $index;
    };
    $scope.orderClicked = function ($index) {
        $scope.orderSelectedNum = $index;
        $scope.multi_pay_amount = $scope.orders[$index].deposit>3000?3000:$scope.orders[$index].deposit;
        $scope.payTimes = 0;
        $scope.more_toggle = false;
        $scope.more_text = "更多支付方式";
        // $scope.multi_pay_text_editing = false;
        $scope.multi_pay_edit_bth = "修改";
        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].deposit;
    };
    $scope.changePayTimes = function (index) {
        $scope.payTimes = index;
        // console.log(index);
        if(index==0){
            $scope.pay_price = $scope.orders[$scope.orderSelectedNum].deposit;
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
        $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].deposit>3000?3000:$scope.orders[$scope.orderSelectedNum].deposit;
        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].deposit;
        if($scope.orders[$scope.orderSelectedNum].deposit > $scope.multi_pay_amount ){
            $scope.amount_add_editable = true;
        };
    };

    // $scope.edit_multi_pay_num = function () {
    //     $scope.multi_pay_text_editing = !$scope.multi_pay_text_editing;
    //     $scope.multi_pay_edit_bth = $scope.multi_pay_text_editing?"确定":"修改";
    //     if($scope.multi_pay_amount>3000 && $scope.orders[$scope.orderSelectedNum].deposit>3000){
    //         $scope.amount_reduce_editable = $scope.multi_pay_text_editing;
    //     };
    //     if($scope.multi_pay_amount<$scope.orders[$scope.orderSelectedNum].deposit){
    //         $scope.amount_add_editable = $scope.multi_pay_text_editing;
    //     };
    // };

    $scope.multi_pay_amount_reduce = function(){
        // if($scope.multi_pay_text_editing && (Number($scope.multi_pay_amount) - 500) >= 3000){
        if((Number($scope.multi_pay_amount) - 500) >= 3000){
            $scope.multi_pay_amount = (Number($scope.multi_pay_amount) - 500);
            if($scope.multi_pay_amount == 3000){
                $scope.amount_reduce_editable = false;
            }
            if($scope.multi_pay_amount > 3000){
                $scope.amount_reduce_editable = true;
            }
            if($scope.multi_pay_amount < Number($scope.orders[$scope.orderSelectedNum].deposit)){
                $scope.amount_add_editable = true;
            }
        }else if (Number($scope.multi_pay_amount) - 500 < 3000 && $scope.multi_pay_amount != $scope.orders[$scope.orderSelectedNum].deposit) {
            $scope.amount_reduce_editable = false;
            $scope.multi_pay_amount = 3000;
        }
    };
    $scope.multi_pay_amount_add = function(){
        // if($scope.multi_pay_text_editing && (Number($scope.multi_pay_amount) + 500) <= $scope.orders[$scope.orderSelectedNum].deposit){
        if((Number($scope.multi_pay_amount) + 500) <= $scope.orders[$scope.orderSelectedNum].deposit){
            $scope.multi_pay_amount = (Number($scope.multi_pay_amount) + 500);
            if($scope.multi_pay_amount == $scope.orders[$scope.orderSelectedNum].deposit){
                $scope.amount_add_editable = false;
            }
            if($scope.multi_pay_amount > 3000){
                $scope.amount_reduce_editable = true;
            }
            if($scope.multi_pay_amount < Number($scope.orders[$scope.orderSelectedNum].deposit)){
                $scope.amount_add_editable = true;
            }
        }else if (Number($scope.multi_pay_amount) + 500 > $scope.orders[$scope.orderSelectedNum].deposit && $scope.multi_pay_amount != $scope.orders[$scope.orderSelectedNum].deposit) {
            $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].deposit;
            $scope.amount_add_editable = false;
        }
    };

    for(var index in $scope.ids){
        (function(index){
            remoteApiService.getOrderDetail($scope.ids[index])
                .then(function(data) {
                    if (data.code != 1000) {
        //                sweetalert("该订单详情有误，请重新操作","my_xxnr.html");
                    }
                    else {
                        $scope.orders[index] = {};
                        $scope.orders[index].id = data.datas.rows.id;
                        if(data.datas.rows.deposit == data.datas.rows.totalPrice){
                            $scope.orders[index].fullPayment = true;
                        }
                        $scope.orders[index].subOrders = data.datas.rows.subOrders;
                        if(!$scope.orders[index].fullPayment){
                            if($scope.orders[index].subOrders[0].type == 'deposit' && $scope.orders[index].subOrders[0].payStatus == 1 ){
                                $scope.orders[index].orderType = '阶段一：订金'
                            }else{
                                $scope.orders[index].orderType = '阶段二：尾款'
                            }
                        }else{
                            $scope.orders[index].orderType = '订单总额';
                        }

                        $scope.orders[index].deposit = data.datas.rows.deposit;
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
                        $scope.multi_pay_amount = $scope.orders[$scope.orderSelectedNum].deposit>3000?3000:$scope.orders[$scope.orderSelectedNum].deposit;
                        $scope.pay_price = $scope.orders[$scope.orderSelectedNum].deposit;
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
            }
            if($scope.selectedPayMethodIndex!==null){
                if($scope.orders[$scope.orderSelectedNum]){
                    remoteApiService.updateOrderPaytype($scope.orders[$scope.orderSelectedNum].id,$scope.selectedPayMethodIndex+1)
                        .then(function(data) {
                        });
                }
            }
        }

    });

    $scope.pay = function(){
        remoteApiService.isAlive()
            .then(function(data){
                if(data.code == 1000){
                    $scope.showPayPop = true;
                    $scope.isOverflow = true;
                    window.open($scope.payUrl);
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
});
