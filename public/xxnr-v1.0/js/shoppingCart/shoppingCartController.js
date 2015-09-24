/**
 * Created by pepelu on 9/14/2015.
 */
var app = angular.module('xxnr');
app.controller('shoppingCartController', function($scope, remoteApiService, commonService, payService){
    $scope.allSelected = true;
    $scope.shops = [];
    $scope.totalCount = 0;
    $scope.totalPrice = 0;
    $scope.totalSaving = 0;
    $scope.shoppingCartCount = 0;
    var _user = commonService.user;
        remoteApiService.getShoppingCart()
            .then(function (data) {
                $scope.shoppingCartId = data.datas.shopCartId;
                for (var shopIndex in data.datas.rows) {
                    var shopData = data.datas.rows[shopIndex];
                    $scope.shoppingCartCount += parseInt(shopData.goodsList.length);
                    var shop = {};
                    shop.name = shopData.brandName;
                    shop.allSelected = true;
                    shop.items = [];
                    var shopCount = 0;
                    var shopTotal = 0;
                    var shopSaving = 0;
                    for (var itemIndex in shopData.goodsList) {
                        var itemData = shopData.goodsList[itemIndex];
                        var item = {};
                        item.selected = true;
                        item.goodsId = itemData.goodsId;
                        item.detailPageUrl = "product-detail.html?goodsId=" + itemData.goodsId + '&type=' + shop.name;
                        item.thumbnailUrl = commonService.baseUrl + itemData.imgUrl;
                        item.name = itemData.goodsName;
                        item.oldPrice = parseInt(itemData.originalPrice);
                        item.nowPrice = isNaN(parseInt(itemData.unitPrice)) ? item.oldPrice : parseInt(itemData.unitPrice);
                        item.point = itemData.point;
                        item.buyCount = parseInt(itemData.goodsCount);
                        item.buyCountOldValue = item.buyCount;
                        item.totalPrice = item.buyCount * item.nowPrice;
                        item.saving = item.buyCount * (item.oldPrice - item.nowPrice);
                        shopCount += item.buyCount;
                        shopTotal += item.totalPrice;
                        shopSaving += item.saving;
                        shop.items.push(item);
                    }

                    shop.buyCount = shopCount;
                    shop.totalPrice = shopTotal;
                    shop.Saving = shopSaving;
                    $scope.shops.push(shop);
                    $scope.totalCount += shop.buyCount;
                    $scope.totalPrice += shop.totalPrice;
                    $scope.totalSaving += shop.Saving;
                }
            });
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
        for(var itemIndex in $scope.shops[index].items){
			if($scope.shops[index].items[itemIndex].selected == isAllSelected){
				continue;
			}
            $scope.shops[index].items[itemIndex].selected = isAllSelected;
            $scope.selectItem(index, itemIndex);
        }
		
		var shouldModifyAll = true;
		for(var i in $scope.shops){
			if($scope.shops[i].allSelected != $scope.shops[index].allSelected){
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
        if($scope.shops[shopIndex].items[itemIndex].selected){
            $scope.shops[shopIndex].totalCount += $scope.shops[shopIndex].items[itemIndex].buyCount;
            $scope.shops[shopIndex].totalPrice += $scope.shops[shopIndex].items[itemIndex].totalPrice;
            $scope.shops[shopIndex].totalSaving += $scope.shops[shopIndex].items[itemIndex].saving;
            $scope.totalCount += $scope.shops[shopIndex].items[itemIndex].buyCount;
            $scope.totalPrice += $scope.shops[shopIndex].items[itemIndex].totalPrice;
            $scope.totalSaving += $scope.shops[shopIndex].items[itemIndex].saving;
        }
        else{
            $scope.shops[shopIndex].totalCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
            $scope.shops[shopIndex].totalPrice -= $scope.shops[shopIndex].items[itemIndex].totalPrice;
            $scope.shops[shopIndex].totalSaving -= $scope.shops[shopIndex].items[itemIndex].saving;
            $scope.totalCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
            $scope.totalPrice -= $scope.shops[shopIndex].items[itemIndex].totalPrice;
            $scope.totalSaving -= $scope.shops[shopIndex].items[itemIndex].saving;
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
    };
    $scope.add = function(shopIndex, itemIndex){
        $scope.shops[shopIndex].items[itemIndex].buyCount++;
        $scope.shops[shopIndex].totalCount++;
        $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount-1, $scope.shops[shopIndex].items[itemIndex].buyCount);
        submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, $scope.shops[shopIndex].items[itemIndex].buyCount);
    };
    $scope.reduce = function(shopIndex, itemIndex){
        if($scope.shops[shopIndex].items[itemIndex].buyCount > 1) {
            $scope.shops[shopIndex].items[itemIndex].buyCount--;
            $scope.shops[shopIndex].totalCount--;
            $scope.buyCountChange(shopIndex, itemIndex, $scope.shops[shopIndex].items[itemIndex].buyCount + 1, $scope.shops[shopIndex].items[itemIndex].buyCount);
            submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, $scope.shops[shopIndex].items[itemIndex].buyCount);
        }
    };
    $scope.buyCountChange = function(shopIndex, itemIndex, oldValue, newValue){
        if(newValue == null || newValue == '' || parseInt(newValue) < 0 || isNaN(parseInt(newValue))){
            newValue = 0;
        }
        $scope.shops[shopIndex].items[itemIndex].buyCount = parseInt(newValue);
        var totalCountAdded = parseInt(newValue) - parseInt(oldValue);
        var totalPriceAdded = totalCountAdded * $scope.shops[shopIndex].items[itemIndex].nowPrice;
        var totalSavingAdded = totalCountAdded * ($scope.shops[shopIndex].items[itemIndex].oldPrice - $scope.shops[shopIndex].items[itemIndex].nowPrice);
        $scope.shops[shopIndex].items[itemIndex].buyCountOldValue = newValue;
        $scope.shops[shopIndex].totalCount += totalCountAdded;
        $scope.shops[shopIndex].totalPrice += totalPriceAdded;
        $scope.shops[shopIndex].totalSaving += totalSavingAdded;
        $scope.totalCount += totalCountAdded;
        $scope.totalPrice += totalPriceAdded;
        $scope.shops[shopIndex].items[itemIndex].totalPrice += totalPriceAdded;
        $scope.totalSaving += totalSavingAdded;
    };

    var submitChange = function(goodId, newCount){
        remoteApiService.changeCartNum(goodId, newCount);
    };
    $scope.submitChange = submitChange;
    $scope.deleteItem = function(shopIndex, itemIndex){
        submitChange($scope.shops[shopIndex].items[itemIndex].goodsId, 0);
        $scope.totalCount -= $scope.shops[shopIndex].items[itemIndex].buyCount;
        $scope.totalPrice -= $scope.shops[shopIndex].items[itemIndex].nowPrice * $scope.shops[shopIndex].items[itemIndex].buyCount;
        $scope.totalSaving -= ($scope.shops[shopIndex].items[itemIndex].oldPrice - $scope.shops[shopIndex].items[itemIndex].nowPrice) * $scope.shops[shopIndex].items[itemIndex].buyCount;
        $scope.shops[shopIndex].items.splice(itemIndex, 1);
        if($scope.shops[shopIndex].items.length==0){
            $scope.shops.splice(shopIndex, 1);
        }
    };
    $scope.accessShoppingCart = function(){
        commonService.accessShoppingCart();
    };
    $scope.buyAll = function(){
        remoteApiService.addOrder($scope.shoppingCartId, $scope.$parent.selectedAddressId)
            .then(function(data){
                                            window.location.href = '#';
                                            $scope.$parent.showPayPop = true;
                                            window.open(payService.aliPayUrl(data.id));
            });
    };
});