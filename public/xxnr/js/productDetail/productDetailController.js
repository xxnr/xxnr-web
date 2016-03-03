/**
 * Created by pepelu on 9/20/2015.
 */
var app=angular.module('product_detail', ['xxnr_common','shop_cart']);
app.controller('productDetailController',function($scope, $timeout, remoteApiService, commonService, loginService, flyToCart,sideService){
    // if(loginService.isLogin) {
    //     flyToCart.fly();
    // };
    $scope.selectedQuery = [];
    $scope.selectedAdditions = [];
    $scope.needToSelectMoreSKU = false;
    $scope.clickedMethod = 0; // 0: not selected, 1:buy 立即购买, 2:addToShoppingCart 加入购物车
    var sweetalert = commonService.sweetalert;
    $scope.tabs=[{name:'商品详情', isSelected:true}, {name:'详情参数', isSelected:false} /*{name:'买家评论', isSelected:false}*/, {name:'服务说明', isSelected:false}];
    $scope.buy_count = 1;
    $scope.stars = [];
    $scope.blockBuying = false;
    $scope.initDisplay = false;
    $scope._imgIndex = 0;
    $scope.isActive = function (index) {
        return $scope._imgIndex === index;
    };
    $scope.showPrev = function () {
        $scope._imgIndex = ($scope._imgIndex > 0) ? --$scope._imgIndex : $scope.item.imgUrls.length - 1;
    };
    $scope.showNext = function () {
        $scope._imgIndex = ($scope._imgIndex < $scope.item.imgUrls.length - 1) ? ++$scope._imgIndex : 0;
    };
    $scope.showPhoto = function (index) {
        $scope._imgIndex = index;
    };



    remoteApiService.getProductDetail(commonService.getParam('goodsId') || commonService.getParam('id'))
        .then(function(data){
            var good = data;
            var item = {};
            item.product_id = good._id;
            $scope.category = good.category;
            $scope.categoryId = good.categoryId;
            item.onSale = (good.unitPrice === null || good.unitPrice === '')? false:good.unitPrice!=good.originalPrice;
            item.name = good.goodsName;
            item.shortName = item.name.length>28?(item.name.substr(0, 22) + '...') : item.name;
            item.detailUrl = 'productDetail.html?goodsId='+good.goodsId+'&type='+good.typeName;
            item.imgUrls = [];
            item.thumbnailImgUrls = [];
            for(var i in good.pictures){
                // console.log(good.pictures[i]);
                item.imgUrls.push(commonService.baseUrl + good.pictures[i].imgUrl.slice(1));
                item.thumbnailImgUrls.push(commonService.baseUrl + good.pictures[i].imgUrl.slice(1));
            }
            item.online = good.online;
            item.brand = good.brandName;
            item.detail = good.productDesc;
            item.canshu = good.standard;
            item.support = good.support;
            item.rate = good.goodsGreatCount;
            item.level = good.recommendedStar;
            item.SKUAttributes = good.SKUAttributes;
            item.SKUAdditions = good.SKUAdditions;
            for(var i in item.SKUAdditions){
                item.SKUAdditions[i].isSelected = false;
            }
            // item.priceRange = good.SKUPrice;
            item.minPrice = good.SKUPrice?good.SKUPrice.min:0;
            item.maxPrice = good.SKUPrice?good.SKUPrice.max:0;
            if(good.SKUMarketPrice){
                item.marketPriceDisplay = true;
                item.marketMinPrice = good.SKUMarketPrice.min;
                item.marketMaxPrice = good.SKUMarketPrice.max;
            }else{
                item.marketPriceDisplay = false;
                item.marketMinPrice = 0;
                item.marketMaxPrice = 0;
            }
            for(var i in item.SKUAttributes){
                item.SKUAttributes[i].isSelected = [];
                item.SKUAttributes[i].selectable = [];
                // console.log(item.SKUAttributes);
                if(item.SKUAttributes[i].values.length==1){
                    item.SKUAttributes[i].isSelected.push(true);
                    item.SKUAttributes[i].selectable.push(true);

                }else{
                    for(var j in item.SKUAttributes[i].values){
                        item.SKUAttributes[i].isSelected.push(false);
                        item.SKUAttributes[i].selectable.push(true);
                    };
                }

            }
            item.description = good.description;
            item.deposit = good.deposit;
            item.presale = good.presale;
            if(item.presale){
                $scope.blockBuying = true;
            }
            if(item.deposit){
                item.buyActionName = '立即付定金';
            }else{
                item.buyActionName = '立即购买';
            }
            $scope.initDisplay = true;
            $scope.item = item;
            for(var i=1; i<= item.level; i++){
                $scope.stars[i] = true;
            }
            if($scope.isAllSKUSelected()){
                $scope.selectedQuery = getSelectedQuery();
                // for(var i in $scope.item.SKUAttributes){
                //     for(var j in $scope.item.SKUAttributes[i].isSelected){
                //         if($scope.item.SKUAttributes[i].isSelected[j] == true){
                //             $scope.selectedQuery.push({name:$scope.item.SKUAttributes[i].name,value:$scope.item.SKUAttributes[i].values[j]});
                //         }
                //     }
                // };
                remoteApiService.querySKU($scope.item.product_id,$scope.selectedQuery)
                    .then(function(data){
                        if(data.data.SKU){
                            // console.log("get SKU id");
                            $scope.item.SKU_id = data.data.SKU._id;
                        }
                    });
            }
        });
    $scope.product_category = function(){
        switch($scope.category){
                case '汽车':
                    window.location.href='car_list.html';
                    break;
                case '化肥':
                    window.location.href='huafei_list.html';
                    break;
                case '新农咨询':
                    window.location.href='huafei_list.html';
                    break;
                default:
                    break;
            }
    };
    $scope.reduce = function(){
        if($scope.buy_count > 1){
            $scope.buy_count--;
            $scope.buyCountChange($scope.buy_count);
        }
    };
    $scope.add = function(){
        if($scope.buy_count<9999) {
            $scope.buy_count++;
            $scope.buyCountChange($scope.buy_count);
        }
    };
    $scope.buyCountBlur = function(newValue){
        if(newValue == 0 || newValue == null || newValue == '' || parseInt(newValue) < 0 || isNaN(parseInt(newValue))){
            newValue = 1;
        }
        $scope.buy_count = parseInt(newValue);
    };
    $scope.buyCountChange = function(newValue){
        if(newValue == '0'){
            // console.log($timeout);
            $timeout(function() {
                newValue = 1;
                $scope.buy_count = parseInt(newValue);
            }, 500);
        }

    };
    $scope.buy = function(event){
        if(event && $scope.blockBuying){
            event.stopPropagation;
            return;
        }
        // if(!$scope.isAllSKUSelected()){
        //     // sweetalert("请填写所有SKU");
        //     $scope.needToSelectMoreSKU = true;
        //     $scope.clickedMethod = 1;
        //     event.stopPropagation;
        //     return;
        // }
        var success_action = function(){
            var product = {};
            product.id = $scope.item.SKU_id;
            product.count = $scope.buy_count;
            var products = [];
            products.push(product);

            products = encodeURI(encodeURI(JSON.stringify(products)));
            // alert(products);
            window.location.href = 'confirmOrder.html?products=' + products;
        };
        addToShoppingCart(success_action,1);
    };
    $scope.addToShoppingCart = function(event){
        if($scope.isAllSKUSelected() && commonService.user){
            flyToCart.fly();
        }
        if(event && $scope.blockBuying){
            event.stopPropagation;
            return;
        }

        var success_action = function(){
            $scope.$broadcast('shoppingCartController', $scope.buy_count);
        };
        addToShoppingCart(success_action,2);
    };
    $scope.show = function(index){
        for(var tabIndex in $scope.tabs){
            $scope.tabs[tabIndex].isSelected = false;
            $scope.tabs[tabIndex].show_div = false;
        }
        $scope.tabs[index].isSelected = true;
        $scope.tabs[tabIndex].show_div = true;
    };
    $scope.selectSKU = function(SKU_index,value_index){
        if($scope.item.SKUAttributes[SKU_index].selectable[value_index]){
            var temp = $scope.item.SKUAttributes[SKU_index].isSelected[value_index];
            for(var i in $scope.item.SKUAttributes[SKU_index].isSelected){
                $scope.item.SKUAttributes[SKU_index].isSelected[i] = false;
            };
            $scope.item.SKUAttributes[SKU_index].isSelected[value_index] = !temp;
            $scope.selectedQuery = getSelectedQuery();
            // for(var i in $scope.item.SKUAttributes){
            //     for(var j in $scope.item.SKUAttributes[i].isSelected){
            //         if($scope.item.SKUAttributes[i].isSelected[j] == true){
            //             $scope.selectedQuery.push({name:$scope.item.SKUAttributes[i].name,value:$scope.item.SKUAttributes[i].values[j]});
            //         }
            //     }
            // };
            queryOtherSKU();
        };
    };
    $scope.selectAddition = function(value_index){
        if($scope.item.SKUAdditions[value_index].isSelected){
            $scope.item.minPrice = Number($scope.item.minPrice) - Number($scope.item.SKUAdditions[value_index].price);
            $scope.item.maxPrice = Number($scope.item.maxPrice) - Number($scope.item.SKUAdditions[value_index].price);
        }else{
            $scope.item.minPrice = Number($scope.item.minPrice) + Number($scope.item.SKUAdditions[value_index].price);
            $scope.item.maxPrice = Number($scope.item.maxPrice) + Number($scope.item.SKUAdditions[value_index].price);
        }
        if($scope.item.marketMinPrice != 0 && $scope.item.marketMaxPrice !=0){
            if($scope.item.SKUAdditions[value_index].isSelected){
                $scope.item.marketMinPrice = Number($scope.item.marketMinPrice) - Number($scope.item.SKUAdditions[value_index].price);
                $scope.item.marketMaxPrice = Number($scope.item.marketMaxPrice) - Number($scope.item.SKUAdditions[value_index].price);
            }else{
                $scope.item.marketMinPrice = Number($scope.item.marketMinPrice) + Number($scope.item.SKUAdditions[value_index].price);
                $scope.item.marketMaxPrice = Number($scope.item.marketMaxPrice) + Number($scope.item.SKUAdditions[value_index].price);
            }
        }
        $scope.item.SKUAdditions[value_index].isSelected = !$scope.item.SKUAdditions[value_index].isSelected;

        $scope.selectedAdditions = [];
        for(var i in $scope.item.SKUAdditions){
            if($scope.item.SKUAdditions[i].isSelected == true){
                $scope.selectedAdditions.push($scope.item.SKUAdditions[i].ref);
            }
        };
    };
    var queryOtherSKU =  function(){
        remoteApiService.querySKU($scope.item.product_id,$scope.selectedQuery)
            .then(function(data){
                if(data.data.SKU){
                    // console.log("get SKU id");
                    $scope.item.SKU_id = data.data.SKU._id;
                }
                if(data.data.price){
                    $scope.item.minPrice = data.data.price.min;
                    $scope.item.maxPrice = data.data.price.max;
                }
                if(data.data.market_price){
                    $scope.item.marketPriceDisplay = true;
                    $scope.item.marketMinPrice = data.data.market_price.min;
                    $scope.item.marketMaxPrice = data.data.market_price.max;
                }else{
                    $scope.item.marketPriceDisplay = false;
                    $scope.item.marketMinPrice = 0;
                    $scope.item.marketMaxPrice = 0;
                }
                for(var i in data.data.attributes){
                    for(var j in $scope.item.SKUAttributes){
                        if(data.data.attributes[i].name == $scope.item.SKUAttributes[j].name){
                            for(var k in $scope.item.SKUAttributes[j].values){
                                if(data.data.attributes[i].values.indexOf($scope.item.SKUAttributes[j].values[k]) == -1){
                                    $scope.item.SKUAttributes[j].selectable[k] = false;
                                }else{
                                    $scope.item.SKUAttributes[j].selectable[k] = true;
                                }
                            }
                        }
                    }
                }
                if(data.data.additions){
                    $scope.item.SKUAdditions = data.data.additions;
                    for(var i in $scope.item.SKUAdditions){
                        $scope.item.SKUAdditions[i].isSelected = false;
                    }
                }
                // console.log(isAllSKUSelected());
            });

    };
    var addToShoppingCart = function(success_action,clickedMethod){
        if(!$scope.isAllSKUSelected()){

            $scope.needToSelectMoreSKU = true;
            $scope.clickedMethod = clickedMethod;
            event.stopPropagation;
            return;
        }else{
            remoteApiService.addToShoppingCart($scope.item.SKU_id, $scope.buy_count,$scope.selectedAdditions, true)
                .then(function(data){
                    if(data.code == 1000){
                        success_action();
                    }
                })
        }

    };
    $scope.isAllSKUSelected = function(){
        if($scope.item){
            for(var i in $scope.item.SKUAttributes){
                var _flag = false;
                for(var j in $scope.item.SKUAttributes[i].isSelected){
                    if($scope.item.SKUAttributes[i].isSelected[j]==true){
                        _flag = true;
                    }
                }
                if(_flag==false){
                    return false;
                }
            }
            return true;
        }
    };
    $scope.confirm = function () {
        $scope.needToSelectMoreSKU = false;
        if($scope.clickedMethod == 1){
            $scope.buy();
        }else if($scope.clickedMethod == 2){
            $scope.addToShoppingCart();
        }
    };
    var getSelectedQuery = function() {
        var SelectedQuery = [];
        for(var i in $scope.item.SKUAttributes){
            for(var j in $scope.item.SKUAttributes[i].isSelected){
                if($scope.item.SKUAttributes[i].isSelected[j] == true){
                    SelectedQuery.push({name:$scope.item.SKUAttributes[i].name,value:$scope.item.SKUAttributes[i].values[j]});
                }
            }
        };
        return SelectedQuery;
    }
});
