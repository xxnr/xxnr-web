/**
 * Created by pepelu on 9/14/2015.
 */
var app = angular.module('shop_cart', ['xxnr_common']);
app.controller('shoppingCartController', function($scope, remoteApiService, commonService, loginService, sideService){

    var sweetalert = commonService.sweetalert;

    /////////////////////////////////////

    $scope.allSelected = true;
    $scope.shops = [];
    $scope.totalCount = 0;
    $scope.totalPrice = 0;
    $scope.totalSaving = 0;
    $scope.shoppingCartCount = " ";

    $scope.$on('shoppingCartController', function(e,d) {
        //console.log(data);         //子级能得到值
        $scope.shoppingCartCount += d;
        //console.log(d);
    });

    if(loginService.isLogin) {
        remoteApiService.getShoppingCart()
            .then(function (data) {
                $scope.shoppingCartCount = 0;
                if (!data || !data.datas) { // not logged on?
                    if (!data) data = {};
                    if (!data.datas) data.datas = {"rows": []};
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
                    for (var itemIndex in shopData.goodsList) {
                        var itemData = shopData.goodsList[itemIndex];
                        $scope.shoppingCartCount += itemData.goodsCount;

                        if (typeof productFilter === 'function') {
                            var result = productFilter(itemData);
                            if (result[0]) {
                                itemData = result[1];
                            } else {
                                continue;
                            }
                        }

                        var item = {};
                        item.selected = true;
                        item.goodsId = itemData.goodsId;
                        item.detailPageUrl = "productDetail.html?goodsId=" + itemData.goodsId + '&type=' + shop.name;
                        item.thumbnailUrl = commonService.baseUrl + itemData.imgUrl;
                        item.onSale = (itemData.unitPrice == null || itemData.unitPrice == '') ? false : itemData.unitPrice != itemData.originalPrice;
                        item.name = itemData.goodsName;
                        item.oldPrice = parseFloat(itemData.originalPrice).toFixed(2);
                        item.nowPrice = item.onSale ? parseFloat(itemData.unitPrice).toFixed(2) : item.oldPrice;
                        item.point = itemData.point;
                        item.buyCount = parseInt(itemData.buyCount ? itemData.buyCount : itemData.goodsCount);
                        item.oldBuyCount = item.buyCount;
                        item.count = parseInt(itemData.goodsCount);
                        item.deposit = itemData.deposit;
                        item.totalPrice = (item.buyCount * (item.nowPrice)).toFixed(2);
                        item.totalDeposit = (item.buyCount * (item.deposit ? item.deposit : item.nowPrice)).toFixed(2);
                        item.saving = item.buyCount * (item.oldPrice - item.nowPrice);
                        item.hasDeposit = (item.deposit ? true : false);
                        shopCount += item.buyCount;
                        shopTotalPrice += item.totalPrice;
                        shopTotalDeposit += item.totalDeposit;
                        shopSaving += item.saving;
                        shop.items.push(item);
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
            });
    }else{
        $scope.shoppingCartCount = 0;
    }
    $scope.selectAll = function(){
        for(var shopIndex in $scope.shops){
            if($scope.shops[shopIndex].allSelected == $scope.allSelected){
                continue;
            }
            $scope.shops[shopIndex].allSelected = $scope.allSelected;
            $scope.selectShop(shopIndex);
        }
    };
    $scope.selectShop = function(index){
        var isAllSelected = $scope.shops[index].allSelected;
        if($scope.allSelected){
            $scope.allSelected = isAllSelected;
        }
        for(var itemIndex in $scope.shops[index].items){
            if($scope.shops[index].items[itemIndex].selected == isAllSelected){
                continue;
            }
            $scope.shops[index].items[itemIndex].selected = isAllSelected;
            $scope.selectItem(index, itemIndex);
        }

        var shouldModifyAll = true;
        for (var i in $scope.shops) {
            if ($scope.shops[i].allSelected != $scope.shops[index].allSelected) {
                shouldModifyAll = false;
                break;
            }
        }
        if(shouldModifyAll){
            $scope.allSelected = $scope.shops[index].allSelected;
            $scope.selectAll();
        }
    };
    $scope.selectItem = function(shopIndex, itemIndex){
        var isSelected = $scope.shops[shopIndex].items[itemIndex].selected;
        if($scope.shops[shopIndex].allSelected){
            $scope.shops[shopIndex].allSelected = isSelected;
            $scope.allSelected = isSelected;
        }
        var shouldModifyShop = true;
        for(var i in $scope.shops[shopIndex].items){
            if($scope.shops[shopIndex].items[itemIndex].selected != $scope.shops[shopIndex].items[i].selected){
                shouldModifyShop = false;
                break;
            }
        }
        if(shouldModifyShop){
            $scope.shops[shopIndex].allSelected = $scope.shops[shopIndex].items[itemIndex].selected;
            $scope.selectShop(shopIndex);
        }
        calculateTotal();
    };
    $scope.add = function(shopIndex, itemIndex){
        if($scope.shops[shopIndex].items[itemIndex].buyCount < 9999) {
            $scope.shops[shopIndex].items[itemIndex].buyCount++;
            $scope.shops[shopIndex].totalCount++;
            $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount, $scope.shops[shopIndex].items[itemIndex].buyCount - 1);
            submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, $scope.shops[shopIndex].items[itemIndex].buyCount);
        }
    };
    $scope.reduce = function(shopIndex, itemIndex){
        if($scope.shops[shopIndex].items[itemIndex].buyCount > 1) {
            $scope.shops[shopIndex].items[itemIndex].buyCount--;
            $scope.shops[shopIndex].totalCount--;
            $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount, $scope.shops[shopIndex].items[itemIndex].buyCount + 1);
            submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, $scope.shops[shopIndex].items[itemIndex].buyCount);
        }
    };
    $scope.buyCountChange = function(shopIndex, itemIndex, newValue, oldValue){
        //if the item is not selected, select it
        if(!$scope.shops[shopIndex].items[itemIndex].selected){
            $scope.shops[shopIndex].items[itemIndex].selected = true;
            $scope.selectItem(shopIndex, itemIndex);
        }
        //if the newValue is illegal, change to 1
        if(newValue == 0 || newValue == null || newValue == '' || parseInt(newValue) < 0 || isNaN(parseInt(newValue))){
            newValue = 1;
        }

        $scope.shops[shopIndex].items[itemIndex].buyCount = parseInt(newValue);
        calculateItemPrice(shopIndex, itemIndex);
        calculateTotal();

        $scope.shops[shopIndex].items[itemIndex].oldBuyCount = parseInt(newValue);
        $scope.shoppingCartCount += (parseInt(newValue) - parseInt(oldValue));
    };

    var calculateItemPrice = function(shopIndex, itemIndex){
        var item = $scope.shops[shopIndex].items[itemIndex];
        $scope.shops[shopIndex].items[itemIndex].totalPrice = (item.buyCount * item.nowPrice).toFixed(2);
        $scope.shops[shopIndex].items[itemIndex].totalDeposit = (item.buyCount * Number(item.deposit?item.deposit:item.nowPrice)).toFixed(2);
    };

    var calculateTotal = function(){
        var totalCount = 0;
        var totalPrice = 0;
        var totalSaving = 0;
        for( var i in $scope.shops){
            for(var j in $scope.shops[i].items){
                var item = $scope.shops[i].items[j];
                if(item.selected){
                    totalPrice = Number(totalPrice) +  item.buyCount * Number(item.deposit?item.deposit:item.nowPrice);
                    totalCount += item.buyCount;
                    totalSaving +=  item.buyCount * (item.oldPrice - item.nowPrice);
                }
            }
        }

        $scope.totalCount = totalCount;
        $scope.totalPrice = totalPrice.toFixed(2);
        $scope.totalSaving = totalSaving.toFixed(2);
    };

    var submitChange = function(goodId, newCount){
        remoteApiService.changeCartNum(goodId, newCount);
    };
    $scope.submitChange = submitChange;
    $scope.deleteItem = function(shopIndex, itemIndex){
        $scope.shoppingCartCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
        submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, 0);
        $scope.shops[shopIndex].items.splice(itemIndex, 1);
        if($scope.shops[shopIndex].items.length==0){
            $scope.shops.splice(shopIndex, 1);
        }
        calculateTotal();
    };
    $scope.accessShoppingCart = function(){
        commonService.accessShoppingCart();
    };
    $scope.buy = function(){

        var products = [];

        for(var shopIndex = 0; shopIndex<$scope.shops.length; shopIndex++){
            for(var itemIndex = 0; itemIndex < $scope.shops[shopIndex].items.length; itemIndex++){
                if($scope.shops[shopIndex].items[itemIndex].selected){
					var product = {};
                    product.id = $scope.shops[shopIndex].items[itemIndex].goodsId;
                    product.count = $scope.shops[shopIndex].items[itemIndex].buyCount;
					products.push(product);
                }
            }
        }
        if(!$scope.$parent.selectedAddressId || $scope.$parent.selectedAddressId==''){
            sweetalert("请填写您的收货地址");
            return;
        }
        remoteApiService.addOrder($scope.shoppingCartId, $scope.$parent.selectedAddressId, products, 1)
            .then(function(datas){
                $scope.data = datas;
                if(datas.code == 1000) {
                    var commitUrl = "commitPay.html?";
                    for(var orderIndex in datas.orders){
                        commitUrl = commitUrl + "id" + '=' + datas.orders[orderIndex].id + '&';
                    };
                    // console.log(commitUrl);
                    window.location.href = commitUrl;
                }
            });
    };
    $scope.checkout = function(checkoutPage){

        if($scope.shoppingCartCount == 0){
            sweetalert("购物车是空的,快去采购");
        }else if($scope.totalCount==0){
            sweetalert("请至少选中一件商品进行结算");
        }
        else{
            // console.log( $scope.shoppingCartCount);
            var products = [];
            // console.log($scope.shoppingCartCount);
            for(var shopIndex = 0; shopIndex<$scope.shops.length; shopIndex++){
                for(var itemIndex = 0; itemIndex < $scope.shops[shopIndex].items.length; itemIndex++){
                    if($scope.shops[shopIndex].items[itemIndex].selected){
                        var product={};
                        product.id = $scope.shops[shopIndex].items[itemIndex].goodsId;
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
    $scope.$on('$viewContentLoaded', function(){
        // check if there is query in url
        // and fire search in case its value is not empty
        $footer = $(".options-box"),
            originalTop = $footer.offset().top,
            originalLeft = $footer.offset().left;
        console.log(originalTop);
        console.log(originalLeft);
    });


});
