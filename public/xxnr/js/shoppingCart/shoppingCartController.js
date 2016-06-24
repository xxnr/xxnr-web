/**
 * Created by pepelu on 9/14/2015.
 */
var app = angular.module('shop_cart', ['xxnr_common',"ngFlash"]);
app.controller('shoppingCartController', function($scope, $timeout, remoteApiService, commonService, loginService, sideService, shoppingCartService, Flash) {


    var sweetalert = commonService.sweetalert;
    /////////////////////////////////////

    $scope.allSelected = true;
    $scope.shops = [];
    $scope.totalCount = 0;
    $scope.totalPrice = 0;
    $scope.totalSaving = 0;
    $scope.shoppingCartCount = " ";
    $scope.$parent.SKUs = [];
    $scope.$parent.products_Ids = [];
    $scope.$on('shoppingCartController', function(e, d) {
        //console.log(data);         //子级能得到值
        $scope.shoppingCartCount += d;
        shoppingCartService.setSCart($scope.shoppingCartCount);
        // console.log(d);
    });

    if (loginService.isLogin) {
        // only cart page get shoppingCart api
        if ((window.location.pathname.indexOf('cart.html') != -1) || (window.location.pathname.indexOf('confirmOrder.html') != -1)) {
            remoteApiService.getShoppingCart()
                .then(function(data) {
                    $scope.shoppingCartCount = 0;
                    if (!data || !data.datas) { // not logged on?
                        if (!data) data = {};
                        if (!data.datas) data.datas = {
                            "rows": []
                        };
                    }
                    $scope.shoppingCartId = data.datas.shopCartId || data.datas.cartId;
                    for (var shopIndex in data.datas.rows) {
                        var shopData = data.datas.rows[shopIndex];
                        var shop = {};
                        shop.name = shopData.brandName;
                        shop.allSelected = true;
                        shop.items = [];
                        var shopCount = 0;
                        var shopTotalPrice = 0;
                        var shopTotalDeposit = 0;
                        var shopSaving = 0;
                        for (var itemIndex in shopData.SKUList) {
                            if(shopData.SKUList.hasOwnProperty(itemIndex)) {
                                var itemData = shopData.SKUList[itemIndex];
                                //console.log(itemData);
                                $scope.shoppingCartCount += itemData.count;

                                if (typeof productFilter === 'function') {
                                    var result = productFilter(itemData);

                                    if (result[0]) {
                                        itemData = result[1];
                                    } else {
                                        continue;
                                    }
                                }
                                //console.log(JSON.parse(location.search.substring(1)));
                                //console.log(decodeURI(location.search).substring(1));

                                //如果是立即购买的话,会通过url传过来相关商品的信息,下面是解析过程
                                if(location.search){
                                    var decodedProducts = decodeURI(decodeURI(location.search));
                                    var buyNowProducts = JSON.parse('['+decodedProducts.match(/\?products=\[(.+)\]/)[1]+']');
                                }
                                //console.log(buyNowProducts);
                                var item = {};
                                item.selected = true;
                                item.SKU_id = itemData._id;
                                item.product_id = itemData.product_id;
                                item.detailPageUrl = "productDetail.html?goodsId=" + itemData.goodsId + '&type=' + shop.name;
                                item.thumbnailUrl = commonService.baseUrl + itemData.imgUrl;
                                item.onSale = (itemData.unitPrice == null || itemData.unitPrice == '') ? false : itemData.unitPrice != itemData.originalPrice;
                                item.online = itemData.online;
                                if (!item.online) {
                                    item.selected = undefined;
                                }
                                item.name = itemData.productName.length > 40 ? (itemData.productName.substr(0, 40) + '...') : itemData.productName;
                                item.additions = itemData.additions;
                                item.additionsPrice = 0;
                                for (var i in item.additions) {
                                    if(item.additions.hasOwnProperty(i)){
                                        item.additionsPrice = item.additionsPrice + item.additions[i].price;
                                    }
                                }
                                item.attributes = itemData.attributes;
                                item.oldPrice = parseFloat(itemData.originalPrice).toFixed(2);
                                // item.nowPrice = item.deposit ? parseFloat(itemData.unitPrice).toFixed(2) : item.oldPrice;
                                item.nowPrice = Number(itemData.price).toFixed(2);
                                item.point = itemData.point;
                                // item.buyCount = parseInt(itemData.buyCount ? itemData.buyCount : itemData.goodsCount);
                                if(buyNowProducts){
                                    item.buyCount = buyNowProducts.length==1?buyNowProducts[0].count:Number(itemData.count);
                                }else{
                                    item.buyCount = Number(itemData.count);
                                }

                                item.oldBuyCount = item.buyCount;
                                // item.count = parseInt(itemData.goodsCount);
                                item.deposit = itemData.deposit;
                                item.additionsTotalPrice = Number((item.additionsPrice*item.buyCount).toFixed(2));
                                item.totalPrice = Number((item.buyCount * (item.nowPrice)).toFixed(2));

                                item.totalDeposit = Number((item.buyCount * (item.deposit ? item.deposit : item.nowPrice)).toFixed(2));
                                item.saving = item.buyCount * (item.oldPrice - item.nowPrice);
                                item.hasDeposit = (item.deposit ? true : false);
                                shopCount += item.buyCount;
                                shopTotalPrice += item.totalPrice;
                                shopTotalDeposit += item.totalDeposit;
                                shopSaving += item.saving;
                                // console.log(item);
                                shop.items.push(item);
                            }
                        }

                        $scope.$broadcast('dataloaded');

                        shop.buyCount = shopCount;
                        shop.totalPrice = shopTotalPrice;
                        shop.totalDeposit = shopTotalDeposit;
                        shop.Saving = shopSaving;
                        if (shop.buyCount > 0) {
                            $scope.shops.push(shop);
                            calculateTotal();
                        }


                    }
                    for (var shopIndex = 0; shopIndex < $scope.shops.length; shopIndex++) {
                        for (var itemIndex = 0; itemIndex < $scope.shops[shopIndex].items.length; itemIndex++) {
                            if ($scope.shops[shopIndex].items[itemIndex].selected) {
                                var SKU = {};
                                SKU._id = $scope.shops[shopIndex].items[itemIndex].SKU_id;
                                SKU.count = $scope.shops[shopIndex].items[itemIndex].buyCount;
                                var product_id = $scope.shops[shopIndex].items[itemIndex].product_id;
                                $scope.$parent.products_Ids.push(product_id);
                                $scope.$parent.SKUs.push(SKU);
                            }
                        }
                    }
                    if(window.location.href.indexOf("confirmOrder") != -1 && $scope.shops.length == 0){
                        window.location.href="cart.html";
                    }
                    if(window.location.href.indexOf("confirmOrder") != -1){
                        $scope.$parent.checkHasAvailableCompany();
                    }

                    // set shoppingCartCount
                    shoppingCartService.setSCart($scope.shoppingCartCount);
                    remoteApiService.getDeliveries($scope.$parent.SKUs)
                        .then(function(data){
                            if(data.code == 1000){
                                data.datas.items.sort(function(a, b) {
                                    return b.sort - a.sort;
                                });

                                $scope.$parent.deliveries = data.datas.items;
                                $scope.$parent.deliveryMethod = $scope.$parent.deliveries[0].deliveryType;
                            }
                        });
                });
        } else {
            var count = shoppingCartService.getSCart();
            // console.log(count);
            if (count) {
                $scope.shoppingCartCount = parseInt(count);
            } else {
                $scope.shoppingCartCount = 0;
            }
        }
    } else {
        $scope.shoppingCartCount = 0;
    }
    $scope.selectAll = function() {
        for (var shopIndex in $scope.shops) {
            if ($scope.shops[shopIndex].allSelected == $scope.allSelected) {
                continue;
            }
            $scope.shops[shopIndex].allSelected = $scope.allSelected;
            $scope.selectShop(shopIndex);
        }
    };
    $scope.selectShop = function(index) {
        var isAllSelected = $scope.shops[index].allSelected; //true
        if ($scope.allSelected) {
            $scope.allSelected = isAllSelected;
        }

        for (var itemIndex in $scope.shops[index].items) {
            // console.log($scope.shops[index].items[itemIndex].selected);
            if (typeof $scope.shops[index].items[itemIndex].selected !== 'undefined') {
                if ($scope.shops[index].items[itemIndex].selected == isAllSelected) {
                    continue;
                }
                $scope.shops[index].items[itemIndex].selected = isAllSelected;
                $scope.selectItem(index, itemIndex);
            }
        }

        var shouldModifyAll = true;
        for (var i in $scope.shops) {
            if ($scope.shops[i].allSelected != $scope.shops[index].allSelected && !$scope.onlyHasOffline(i)) {

                shouldModifyAll = false;
                break;
            }
        }
        if (shouldModifyAll) {
            // console.log('test');
            $scope.allSelected = $scope.shops[index].allSelected;
            $scope.selectAll();
        }
    };
    $scope.selectItem = function(shopIndex, itemIndex) {
        var isSelected = $scope.shops[shopIndex].items[itemIndex].selected;
        if ($scope.shops[shopIndex].allSelected) {
            $scope.shops[shopIndex].allSelected = isSelected;
            // $scope.allSelected = isSelected;
        }
        if ($scope.allSelected) {
            $scope.allSelected = isSelected;
        }
        var shouldModifyShop = true;
        for (var i in $scope.shops[shopIndex].items) {
            if ($scope.shops[shopIndex].items[itemIndex].selected != $scope.shops[shopIndex].items[i].selected && $scope.shops[shopIndex].items[i].selected !== undefined) {
                shouldModifyShop = false;
                break;
            }
        }
        if (shouldModifyShop) {
            $scope.shops[shopIndex].allSelected = $scope.shops[shopIndex].items[itemIndex].selected;
            $scope.selectShop(shopIndex);
        }
        calculateTotal();
    };
    $scope.add = function(shopIndex, itemIndex) {
        if ($scope.shops[shopIndex].items[itemIndex].buyCount < 9999) {
            $scope.shops[shopIndex].items[itemIndex].buyCount++;
            $scope.shops[shopIndex].totalCount++;
            $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount, $scope.shops[shopIndex].items[itemIndex].buyCount - 1);
            addToSKUCartNum($scope.shops[shopIndex].items[itemIndex].SKU_id);
        }
    };
    $scope.reduce = function(shopIndex, itemIndex) {
        if ($scope.shops[shopIndex].items[itemIndex].buyCount > 1) {
            $scope.shops[shopIndex].items[itemIndex].buyCount--;
            $scope.shops[shopIndex].totalCount--;
            $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount, $scope.shops[shopIndex].items[itemIndex].buyCount + 1);
            reduceToSKUCartNum($scope.shops[shopIndex].items[itemIndex].SKU_id);
        }
    };
    $scope.buyCountChange = function(shopIndex, itemIndex, newValue, oldValue) {
        //if the item is not selected, select it
        if (!$scope.shops[shopIndex].items[itemIndex].selected) {
            $scope.shops[shopIndex].items[itemIndex].selected = true;
            $scope.selectItem(shopIndex, itemIndex);
        }
        //if the newValue is illegal, change to 1
        if (newValue == 0 || newValue == null || newValue == '' || parseInt(newValue) < 0 || isNaN(parseInt(newValue))) {
            newValue = 1;
        }

        $scope.shops[shopIndex].items[itemIndex].buyCount = parseInt(newValue);
        calculateItemPrice(shopIndex, itemIndex);
        calculateTotal();

        $scope.shops[shopIndex].items[itemIndex].oldBuyCount = parseInt(newValue);
        $scope.shoppingCartCount += (parseInt(newValue) - parseInt(oldValue));
    };

    var calculateItemPrice = function(shopIndex, itemIndex) {
        var item = $scope.shops[shopIndex].items[itemIndex];
        $scope.shops[shopIndex].items[itemIndex].totalPrice = Number((item.buyCount * item.nowPrice).toFixed(2));
        $scope.shops[shopIndex].items[itemIndex].totalDeposit = Number((item.buyCount * Number(item.deposit ? item.deposit : item.nowPrice)).toFixed(2));
    };

    var calculateTotal = function() {
        var totalCount = 0;
        var totalPrice = 0;
        var totalSaving = 0;
        for (var i in $scope.shops) {
            for (var j in $scope.shops[i].items) {
                var item = $scope.shops[i].items[j];
                if (item.selected) {
                    totalPrice = Number(totalPrice) + item.buyCount * Number(item.deposit ? item.deposit : item.nowPrice);
                    //console.log(item);
                    item.additionsTotalPrice = Number((item.additionsPrice*item.buyCount).toFixed(2));
                    if(item.deposit == 0){          //如果定金为0,就为一口价商品,如要加上附加选项的价格
                        totalPrice = totalPrice + item.additionsTotalPrice;
                    };
                    totalCount += item.buyCount;
                    totalSaving += item.buyCount * (item.oldPrice - item.nowPrice);
                }
            }
        }

        $scope.totalCount = totalCount;
        $scope.totalPrice = totalPrice.toFixed(2);
        $scope.totalSaving = totalSaving.toFixed(2);
    };

    var submitChange = function(SKU_id, newCount) {
        // remoteApiService.changeCartNum(goodId, newCount);
        remoteApiService.changeCartNum(SKU_id, newCount)
            .then(function(data) {
                if (data && data.code == 1000) {
                    // set shoppingCartCount
                    shoppingCartService.setSCart($scope.shoppingCartCount);
                } else {
                    window.location.href = window.location.href;
                }
            });
    };
    var addToSKUCartNum = function(SKU_id){
        remoteApiService.addToShoppingCart(SKU_id,1,[] ,true)
            .then(function(data) {
                if (data && data.code == 1000) {
                    // set shoppingCartCount
                    shoppingCartService.setSCart($scope.shoppingCartCount);
                }
            });
    };
    var reduceToSKUCartNum = function(SKU_id){
        remoteApiService.addToShoppingCart(SKU_id,-1,[] ,true)
            .then(function(data) {
                if (data && data.code == 1000) {
                    // set shoppingCartCount
                    shoppingCartService.setSCart($scope.shoppingCartCount);
                }
            });
    };
    $scope.submitChange = submitChange;
    $scope.deleteItem = function(shopIndex, itemIndex) {
        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i) == "8.") {
            var r = confirm("您确定要删除吗?");
            if (r == true) {
                remoteApiService.changeCartNum($scope.shops[shopIndex].items[itemIndex].SKU_id, 0)
                    .then(function(data) {
                        if (data && data.code == 1000) {
                            $scope.shoppingCartCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
                            $scope.shops[shopIndex].items.splice(itemIndex, 1);
                            if ($scope.shops[shopIndex].items.length == 0) {
                                $scope.shops.splice(shopIndex, 1);
                            }
                            calculateTotal();
                            var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">删除商品成功';
                            var id = Flash.create('success', message, 3000, {class: 'xxnr-success-flash', id: 'xxnr-success-flash'}, false);
                            // set shoppingCartCount
                            shoppingCartService.setSCart($scope.shoppingCartCount);
                        } else {
                            //window.location.href = window.location.href;
                            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">'+data.message;
                            var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                        }
                    });
            } else {
                return false;
            }
        } else {
            swal({
                    title: " ",
                    text: "\n\n您确定要删除吗?\n\n",
                    //type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: '#00913a',
                    confirmButtonText: '确定',
                    cancelButtonText: "取消",
                    closeOnConfirm: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        //submitChange($scope.shops[shopIndex].items[itemIndex].SKU_id, 0);

                        remoteApiService.changeCartNum($scope.shops[shopIndex].items[itemIndex].SKU_id, 0)
                            .then(function(data) {
                                if (data && data.code == 1000) {
                                    $scope.shoppingCartCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
                                    $scope.shops[shopIndex].items.splice(itemIndex, 1);
                                    if ($scope.shops[shopIndex].items.length == 0) {
                                        $scope.shops.splice(shopIndex, 1);
                                    }
                                    calculateTotal();
                                    var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">删除商品成功';
                                    var id = Flash.create('success', message, 3000, {class: 'xxnr-success-flash', id: 'xxnr-success-flash'}, false);
                                    // set shoppingCartCount
                                    shoppingCartService.setSCart($scope.shoppingCartCount);
                                } else {
                                    //window.location.href = window.location.href;
                                    var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">'+data.message;
                                    var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                                }
                            });


                    }
                });
        }

    };
    $scope.accessShoppingCart = function() {
        commonService.accessShoppingCart();
    };
    $scope.buy = function(deliveryType,RSCId,consigneePhone,consigneeName) {
        //var SKUs = []
        //for (var shopIndex = 0; shopIndex < $scope.shops.length; shopIndex++) {
        //    for (var itemIndex = 0; itemIndex < $scope.shops[shopIndex].items.length; itemIndex++) {
        //        if ($scope.shops[shopIndex].items[itemIndex].selected) {
        //            var SKU = {};
        //            SKU._id = $scope.shops[shopIndex].items[itemIndex].SKU_id;
        //            SKU.count = $scope.shops[shopIndex].items[itemIndex].buyCount;
        //            SKUs.push(SKU);
        //        }
        //    }
        //}

        if (deliveryType == 2 && (!$scope.$parent.selectedAddressId || $scope.$parent.selectedAddressId == '')) {
            //sweetalert("请填写您的收货地址");
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请填写您的收货地址';
            var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
            return;
        }
        if (deliveryType == 1) {
            if(!$scope.$parent.hasCompany){
                //sweetalert("您选择的商品不能在同一个网点自提，请返回购物车重新选择");
                var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">您选择的商品不能在同一个网点自提，请返回购物车重新选择';
                var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                return;
            }else if(RSCId==-1 && $scope.$parent.hasCompany){
                //sweetalert("请选择自提网点");
                var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请选择自提网点';
                var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                return;
            }
            if(!consigneePhone || !consigneeName){
                //sweetalert("请填写收货人信息");
                var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请填写收货人信息';
                var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
                return;
            }
        }
        var payType = 1;
            remoteApiService.addOrder($scope.shoppingCartId, $scope.$parent.selectedAddressId, $scope.$parent.SKUs, payType , deliveryType, RSCId,consigneePhone, consigneeName)
            .then(function(datas) {
                $scope.data = datas;
                if (datas.code == 1000) {
                    var commitUrl = "commitPay.html?";
                    for (var orderIndex in datas.orders) {
                        if(datas.orders.hasOwnProperty(orderIndex)){
                            commitUrl = commitUrl + "id" + '=' + datas.orders[orderIndex].id + '&';
                            // set shoppingCartCount
                            if (datas.orders[orderIndex] && datas.orders[orderIndex].SKUs) {
                                for (var SKUIndex in datas.orders[orderIndex].SKUs) {
                                    var sku = datas.orders[orderIndex].SKUs[SKUIndex];
                                    $scope.shoppingCartCount -= sku.count;
                                }
                            }
                            shoppingCartService.setSCart($scope.shoppingCartCount);
                        }
                    };
                    // console.log(commitUrl);
                    window.location.href = commitUrl;
                }
            });
    };
    $scope.checkout = function(checkoutPage) {

        if ($scope.shoppingCartCount == 0) {
            //sweetalert("购物车是空的,快去采购");
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">购物车是空的,快去采购';
            var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
        } else if ($scope.totalCount == 0) {
            //sweetalert("请至少选中一件商品进行结算");
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请至少选中一件商品进行结算';
            var id = Flash.create('success', message, 3000, {class: 'xxnr-warning-flash', id: 'xxnr-warning-flash'}, false);
        } else {
            // console.log( $scope.shoppingCartCount);
            var products = [];
            // console.log($scope.shoppingCartCount);
            for (var shopIndex = 0; shopIndex < $scope.shops.length; shopIndex++) {
                for (var itemIndex = 0; itemIndex < $scope.shops[shopIndex].items.length; itemIndex++) {
                    if ($scope.shops[shopIndex].items[itemIndex].selected) {
                        var product = {};
                        product.id = $scope.shops[shopIndex].items[itemIndex].SKU_id;
                        product.count = $scope.shops[shopIndex].items[itemIndex].buyCount;
                        products.push(product);
                    }
                }
            }
            products = encodeURI(encodeURI(JSON.stringify(products)));
            // alert(products);
            window.location.href = checkoutPage + '?products=' + products;

        }
    };
    $scope.onlyHasOffline = function(index) {
        var result = true;
        for (var itemIndex in $scope.shops[index].items) {
            // console.log($scope.shops[index].items[itemIndex].selected);
            if (typeof $scope.shops[index].items[itemIndex].selected !== 'undefined') {
                return false;
            }
        }
        return result;
    };
    $scope.onlyHasOfflineShop = function() {
        var result = true;
        for (var shopIndex in $scope.shops) {
            if (!$scope.onlyHasOffline(shopIndex)) {
                return false;
            }
        }
        return result;
    };

});
