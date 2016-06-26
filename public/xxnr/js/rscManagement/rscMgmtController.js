/**
 * Created by xxnr-cd on 16/4/5.
 */

var app = angular.module('rsc_management', ['xxnr_common', 'shop_cart',"ngFlash"]);
app.filter('fixedTwo', function () {
    return function(input) {
        return input = input.toFixed(2);
    };
});
app.controller('rscManagementController', function($scope, $rootScope,remoteApiService, loginService, commonService, sideService, Flash, $timeout) {
    $scope.showTypes = [{
        name: '所有订单',
        isSelected: true
    }, {
        id: 1,
        name: '待付款',
        isSelected: false
    }, {
        id: 2,
        name: '待审核',
        isSelected: false
    }, {
        id: 3,
        name: '待配送',
        isSelected: false
    }, {
        id: 4,
        name: '待自提',
        isSelected: false
    }, {
        id: 5,
        name: '已完成',
        isSelected: false
    }];

    $scope.shippingSKUs = [];  //RSC要配送的收货物品列表
    $scope.shippingSKU_refs = [];  //RSC要配送的收货物品id列表
    $scope.RSC_pickingUp_errMsg = '';
    var sweetalert = commonService.sweetalert;

    $scope.focusShowValidate = function() {
        $scope.RSC_pickingUp_errMsg = '';
    };

    $scope.current_page = 1;
    $scope.pageCount = 0;
    $scope.showRSC_ConfirmPayment = false;
    $scope.showRSC_Shipping = false;
    $scope.showRSC_Pickup = false;
    $scope.RSC_ConfirmPayment_payMethod = 3;
    $scope.pickingUp_step = 1;
    $scope.pickUpCode = null;
    $scope.orderSearchInput = '';
    $scope.searchOrder = false;   //点击搜索订单

    var reset_RSC_ConfirmPayment_pop = function(){
        $scope.RSC_ConfirmPayment_payMethod = 3;
        $scope.RSC_ConfirmPayment_consignee = '';
        $scope.RSC_ConfirmPayment_duePrice = '';
        $scope.RSC_ConfirmPayment_orderId = null;
    };
    var reset_RSC_Shipping_pop = function(){
        $scope.shippingOrderId = null;
        $scope.shippingSKU_refs = [];
        $scope.shippingSKUs = [];
    };
    var reset_RSC_Pickup_pop = function(){
        $scope.pickingUpOrderId = null;
        $scope.pickingUpSKUs = [];
        $scope.pickingUpSKU_refs = [];
        $scope.pickUpCode = null;
        $scope.pickingUp_step = 1;
    };
    $scope.closePop = function() {
        $scope.isOverflow = false;

        $scope.showRSC_ConfirmPayment = false;
        reset_RSC_ConfirmPayment_pop();

        $scope.showRSC_Shipping = false;
        reset_RSC_Shipping_pop();

        $scope.showRSC_Pickup = false;
        reset_RSC_Pickup_pop()
    };

    var generate_page = function() {
        $scope.pages = [];
        for (var id = 1; id <= $scope.pageCount; id++) {
            $scope.pages.push({
                id: id,
                isSelected: false
            });
        }
        if ($scope.pages.length > 0) {
            $scope.pages[0].isSelected = true;
        }
        for (var pageIndex in $scope.pages) {
            if ($scope.pages[pageIndex].id == $scope.current_page) {
                $scope.pages[pageIndex].isSelected = true;
            } else {
                $scope.pages[pageIndex].isSelected = false;
            }
        }
        if($scope.pages.length<=7){                                                     // e.g.: 1 2 3 4 5 6 7
            $scope.pages = $scope.pages;
        }else if($scope.pages.length>7 && $scope.current_page<5){                              // e.g.: 1 2 3 4 5 ... 20
            $scope.pages = $scope.pages.slice(0,6).concat($scope.pages[$scope.pages.length-1]);
            $scope.pages[5].id = '...';
        }else if($scope.pages.length>7 && $scope.current_page <= $scope.pages_count && $scope.current_page> $scope.pages_count - 4 ) {    // e.g.: 1 ... 16 17 18 19 20
            $scope.pages = $scope.pages.slice(0,1).concat($scope.pages.slice($scope.pages.length-6,$scope.pages.length));
            $scope.pages[1].id = '...';
        }else{                                                                          // e.g.: 1 .. 8 9 10 ... 20
            var tempFirst = $scope.pages[0];
            var tempLast = $scope.pages[$scope.pages.length-1];
            $scope.pages = $scope.pages.slice($scope.current_page-3,$scope.current_page+2);
            $scope.pages[0].id = '...';
            $scope.pages[$scope.pages.length-1].id = '...';
            $scope.pages.push(tempLast);
            $scope.pages.unshift(tempFirst);
        }
    };
    $scope.show_page = function(pageId) {
        $scope.current_page = pageId;
        for (var pageIndex in $scope.pages) {
            if($scope.pages.hasOwnProperty(pageIndex)){
                if ($scope.pages[pageIndex].id == pageId) {
                    $scope.pages[pageIndex].isSelected = true;
                } else {
                    $scope.pages[pageIndex].isSelected = false;
                }
            }
        }
        for (var i = 0; i < $scope.showTypes.length; i++) {
            if ($scope.showTypes[i].isSelected == true) {
                $scope.show($scope.showTypes[i].id, i,null,0,$scope.orderSearchInput);
            }
        }
    };


    $scope.pre_page = function() {
        if ($scope.current_page > 1) {
            $scope.current_page--;
            $scope.show_page($scope.current_page);
        }
    };
    $scope.next_page = function() {
        if ($scope.current_page < $scope.pageCount) {
            $scope.current_page++;
            $scope.show_page($scope.current_page);
        }
    };


    $scope.calculateTotalAdditionsPrice = function(additions){
        var totalAdditionsPrice = 0;
        for(var i in additions){
            if(additions.hasOwnProperty(i)){
                totalAdditionsPrice = totalAdditionsPrice + Number(additions[i].price?additions[i].price:0);
            }
        }
        return Number(totalAdditionsPrice.toFixed(2));
    };
    $scope.RSC_ConfirmPayment = function(){
        if($scope.RSC_ConfirmPayment_payMethod >= 0){
            remoteApiService.getOrderDetail($scope.RSC_ConfirmPayment_orderId)
                .then(function(data) {
                if(data.code == 1000) {
                    remoteApiService.confirmOfflinePay(data.datas.rows.payment.paymentId,data.datas.rows.payment.price,$scope.RSC_ConfirmPayment_payMethod)
                        .then(function(new_data) {
                            if(new_data.code == 1000){
                                //sweetalert('审核付款成功', "rsc_management.html");
                                //$scope.closePop();
                                var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">审核付款成功';
                                var id = Flash.create('success', message, 3000, {class: 'xxnr-success-flash', id: 'xxnr-success-flash'}, false);
                                $scope.closePop();
                            } else {
                                //sweetalert('审核付款失败', "rsc_management.html");
                                //$scope.closePop();
                                var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">订单已审核';
                                var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                                $scope.closePop();
                            }
                        });

                }
            });


        }
    };

    $scope.show = function(showTypeId,tabIndex,page,reset,orderQueryStr) {
        //console.log(arguments);
        if (reset > 0) {
            $scope.current_page = 1;
        };
        if(tabIndex != 0){   //当点击非 "所有订单"tab的时候隐藏 搜索输入框并且清空
            $scope.orderSearchInput = '';
            $scope.searchOrder = false;
            orderQueryStr = $scope.orderSearchInput;
        }
        remoteApiService.rscGetOrders(showTypeId,page?page:$scope.current_page,null,orderQueryStr)
            .then(function(data) {

                //if(tabIndex != 0){   //当点击非 "所有订单"tab的时候隐藏 搜索输入框并且清空
                //    $scope.orderSearchInput = '';
                //}
                if($scope.orderSearchInput){
                    $scope.searchOrder = true;
                }
                $scope.orderList = [];
                $scope.pageCount = data.pageCount;
                generate_page();
                var orders = data.orders;
                for (var showType in $scope.showTypes) {
                    if($scope.showTypes.hasOwnProperty(showType)){
                        $scope.showTypes[showType].isSelected = false;
                    }
                }
                $scope.showTypes[tabIndex].isSelected = true;
                //for (var i = 0; i < orders.length; i++) {
                for(var i in orders){
                    if(orders.hasOwnProperty(i)){
                        var order = {};

                        if (orders[i].SKUs) {
                            if (orders[i].SKUs.length > 0) {
                                order.products = orders[i].SKUs;
                            }
                        }
                        for (var j in order.products) {
                            if (order.products.hasOwnProperty(j)) {
                                order.products[j].totalAdditionsPrice = $scope.calculateTotalAdditionsPrice(order.products[j].additions);
                            }
                        }


                        order.id = orders[i].id;
                        order.orderNo = orders[i].paymentId;
                        order.totalPrice = orders[i].price.toFixed(2);
                        order.duePrice = orders[i].duePrice.toFixed(2);
                        order.consigneeName = orders[i].consigneeName;
                        order.consigneePhone = orders[i].consigneePhone;
                        order.consigneeAddress = orders[i].consigneeAddress;

                        order.phone = orders[i].consigneePhone;
                        order.deliveryTime = orders[i].dateDelivered;
                        order.createTime = orders[i].dateCreated;
                        order.type = orders[i].type;
                        order.deliveryType = orders[i].deliveryType;
                        order.SKUs = orders[i].SKUs;
                        order.subOrders = orders[i].subOrders;
                        //var d = new Date(commonService.parseDate(orders[i].dateCreated));
                        order.createTime_local = commonService.convertDateIncludeHMM(orders[i].dateCreated);

                        if(order.type.type == 0){
                            order.showAction = false;
                        }else if(order.type.type == 1){
                            order.showAction = false;
                        }else if(order.type.type == 2){
                            order.actionName = '审核付款';
                            order.showAction = true;
                            order.action = function(order) {
                                $scope.showRSC_ConfirmPayment = true;
                                $scope.isOverflow = true;
                                remoteApiService.getOrderDetail(order.id)
                                    .then(function(data) {
                                        if(data.code == 1000) {
                                            if(data.datas.rows.order.orderStatus && data.datas.rows.order.orderStatus.type != 7){
                                                var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">订单已审核';
                                                var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                                                $timeout(function(){
                                                    window.location.href = window.location.href;
                                                    return false
                                                },3000);
                                            }else{
                                                $scope.RSC_ConfirmPayment_duePrice = data.datas.rows.payment.price;
                                            }
                                        }
                                    });
                                $scope.RSC_ConfirmPayment_consignee = order.consigneeName;
                                $scope.RSC_ConfirmPayment_orderId = order.id;
                            }
                        }else if(order.type.type == 3){
                            order.showAction = false;
                        }else if(order.type.type == 4){
                            order.actionName = '开始配送';
                            if(order.SKUs){
                                for(var x in order.SKUs){
                                    if(order.SKUs[x].deliverStatus == 4){
                                        order.showAction = true;
                                    }
                                }
                            }
                            order.action = function(order) {

                                $scope.shippingOrderId = order.id;
                                $scope.shippingSKUs = [];
                                $scope.shippingSKUIndex = -1;
                                $scope.showRSC_Shipping = true;
                                $scope.isOverflow = true;
                                //window.scrollTo(0, 0);
                                $scope.shippingSKU_refs = [];

                                if(order.SKUs){
                                    for(var x in order.SKUs){
                                        if(order.SKUs[x].deliverStatus == 4){
                                            $scope.shippingSKUs.push(order.SKUs[x]);
                                        }
                                    }
                                }
                                $scope.shippingSKUs.forEach(function(shippingSKU){
                                    shippingSKU.shortName = shippingSKU.productName.length > 33 ? (shippingSKU.productName.substr(0, 30) + '...') : shippingSKU.productName;
                                });
                            }
                        }else if(order.type.type == 5){
                            order.showAction = false;
                            order.actionName = '客户自提';
                            if(order.SKUs){
                                for(var k in order.SKUs){
                                    if(order.SKUs[k].deliverStatus == 4){
                                        order.showAction = true;
                                    }
                                }
                            }
                            order.action = function(order) {
                                $scope.showRSC_Pickup = true;
                                $scope.isOverflow = true;
                                $scope.pickingUpOrderId = order.id;
                                $scope.pickingUpSKUs = [];
                                $scope.pickingUpSKU_refs = [];
                                if(order.SKUs){
                                    for(var x in order.SKUs){
                                        if(order.SKUs[x].deliverStatus == 4){
                                            $scope.pickingUpSKUs.push(order.SKUs[x]);
                                        }
                                    }
                                }
                                $scope.pickingUpSKUs.forEach(function(pickingUpSKU){
                                    pickingUpSKU.shortName = pickingUpSKU.productName.length > 30 ? (pickingUpSKU.productName.substr(0, 27) + '...') : pickingUpSKU.productName;
                                });
                            }

                        }else if(order.type.type == 6){
                            order.showAction = false;
                            order.actionName = '开始配送';
                            if(order.SKUs){
                                for(var x in order.SKUs){
                                    if(order.SKUs[x].deliverStatus == 4){
                                        order.showAction = true;
                                    }
                                }
                            }
                            order.action = function(order) {

                                $scope.shippingOrderId = order.id;
                                $scope.shippingSKUs = [];
                                $scope.shippingSKUIndex = -1;
                                $scope.showRSC_Shipping = true;
                                $scope.isOverflow = true;
                                //window.scrollTo(0, 0);
                                $scope.shippingSKU_refs = [];

                                if(order.SKUs){
                                    for(var x in order.SKUs){
                                        if(order.SKUs[x].deliverStatus == 4){
                                            $scope.shippingSKUs.push(order.SKUs[x]);
                                        }
                                    }
                                }
                                $scope.shippingSKUs.forEach(function(shippingSKU){
                                    shippingSKU.shortName = shippingSKU.productName.length > 30 ? (shippingSKU.productName.substr(0, 27) + '...') : shippingSKU.productName;
                                });
                            }

                        }
                        $scope.orderList.push(order);
                    }

                }
            });
    };
    $scope.show(null, 0);

    $scope.addToSKU_List = function(index,SKU_list,SKU_list_refs){   //index是要加入list的序号,SKU_list是需要操作的订单列表,SKU_list_refs是被选中的sku的ref
        if(SKU_list_refs.length == 0){
            SKU_list_refs.push(SKU_list[index].ref);
        }else{
            var hasExsited = false;
            for(var i in SKU_list_refs){              //如果已在$scope.ConfirmingSKUs就剔除
                if(SKU_list[index].ref == SKU_list_refs[i]){
                    SKU_list_refs.splice(i, 1);
                    hasExsited = true;
                }
            }
            if(!hasExsited){
                SKU_list_refs.push(SKU_list[index].ref); //不在时就加入$scope.ConfirmingSKUs
            }
        }
    };
    $scope.check_SKU_List = function(index,SKU_list,SKU_list_refs){
        if(SKU_list.hasOwnProperty(index)){
            if(SKU_list_refs.indexOf(SKU_list[index].ref )!=-1){
                return true;
            }else{
                return false;
            }
        }
    };

    $scope.RSC_shipping = function(){
        if($scope.shippingSKU_refs.length>0){
            remoteApiService.RSC_shipping($scope.shippingOrderId,$scope.shippingSKU_refs)
                .then(function(data) {
                    if(data.code == 1000){
                        //sweetalert('开始配送成功', "rsc_management.html");
                        $scope.closePop();
                        var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">开始配送成功';
                        var id = Flash.create('success', message, 3000, {class: 'xxnr-success-flash', id: 'xxnr-success-flash'}, false);
                        $timeout(function(){
                            window.location.href = "/rsc_management.html";
                            return false
                        },3000);
                    }else if(data.code == 1401){
                        //sweetalert('你已被登出，请重新登录', "logon.html");
                        var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">你已被登出，请重新登录';
                        var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                        $timeout(function(){
                            window.location.href = "/logon.html";
                            return false
                        },3000);
                    }else {
                        //sweetalert('开始配送失败', "rsc_management.html");
                        $scope.closePop();
                        var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">开始配送失败';
                        var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                        $timeout(function(){
                            window.location.href = "/rsc_management.html";
                            return false
                        },3000);
                    }
                });
        }
    };
    $scope.RSC_pickingUp_nextStep = function(){
        if($scope.pickingUpSKU_refs.length>0){
            $scope.pickingUp_step = 2;
        }
    };
    $scope.SKU_number = function(SKU_list,SKU_list_refs){   //计算被算中的确认收货的SKU的数量
        var resultNum = 0;
        if(SKU_list_refs){
            SKU_list_refs.forEach(function(SKU_ref){
                if(SKU_list){
                    for(var i in SKU_list){
                        if(SKU_list.hasOwnProperty(i)){
                            if(SKU_ref == SKU_list[i].ref){
                                console.log(SKU_list.count);
                                resultNum = resultNum + SKU_list[i].count;
                            }
                        }
                    }
                }
            });
            return resultNum;
        }
    };
    $scope.RSC_pickingUp_checkCode = function(){
        if($scope.pickUpCode.length == 7){
            remoteApiService.RSC_checkCode($scope.pickingUpOrderId,$scope.pickingUpSKU_refs,$scope.pickUpCode)
                .then(function(data) {
                    if(data.code == 1429){
                        //sweetalert('您输入错误次数较多，请1分钟后再操作');
                        $scope.RSC_pickingUp_errMsg = '您输入错误次数较多，请1分钟后再操作';
                        //$scope.closePop();
                    }else if(data.code == 1000){
                        //sweetalert('客户自提成功', "rsc_management.html");
                        $scope.closePop();
                        var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">客户自提成功';
                        var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                        $timeout(function(){
                            window.location.href = "/rsc_management.html";
                            return false
                        },3000);
                    }else if(data.code == 1401){
                        //sweetalert('你已被登出，请重新登录', "logon.html");
                        var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">你已被登出，请重新登录';
                        var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                        $timeout(function(){
                            window.location.href = "/logon.html";
                            return false
                        },3000);
                    }
                    else {
                        //sweetalert('自提码错误，请重新输入');
                        $scope.RSC_pickingUp_errMsg = '自提码错误，请重新输入';
                        $scope.errorPickupCodeCount = $scope.errorPickupCodeCount + 1;
                    }
                });
        }

    };
});
