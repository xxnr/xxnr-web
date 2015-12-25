/**
 * Created by pepelu on 9/20/2015.
 */
var app=angular.module('product_detail', ['xxnr_common']);
app.controller('productDetailController',function($scope, remoteApiService, commonService){
    $scope.tabs=[{name:'商品详情', isSelected:true}, {name:'详情参数', isSelected:false} /*{name:'买家评论', isSelected:false}*/, {name:'服务说明', isSelected:false}];
    $scope.category = commonService.getParam('type');
    $scope.buy_count = 1;
    $scope.stars = [];

    remoteApiService.getProductDetail(commonService.getParam('goodsId') || commonService.getParam('id'))
        .then(function(data){
            var good = data.datas.rows[0];
            var item = {};
            item.id = good.goodsId;
            item.onSale = (good.unitPrice == null || good.unitPrice == '')? false:good.unitPrice!=good.originalPrice;
            item.name = good.goodsName;
            item.shortName = item.name.length>28?(item.name.substr(0, 22) + '...') : item.name;
            item.detailUrl = 'productDetail.html?goodsId='+good.goodsId+'&type='+data.datas.rows[0].typeName;
            item.imgUrl = commonService.baseUrl + good.imgUrl;
            item.nowPrice = item.onSale?good.unitPrice:good.originalPrice;
            item.oldPrice = good.originalPrice;
            item.brand = good.brandName;
            item.detail = good.productDesc;
            item.canshu = good.standard;
            item.support = good.support;
            item.rate = good.goodsGreatCount;
            item.level = good.recommendedStar;
            item.description = good.description;
            item.deposit = good.deposit;
            if(item.deposit){
                item.buyActionName = '立即付定金';
            }else{
                item.buyActionName = '立即购买';
            }

            $scope.item = item;

            for(var i=1; i<= item.level; i++){
                $scope.stars[i] = true;
            }
        });
    $scope.product_category = function(){
        switch($scope.category){
                case '农用车':
                    window.location.href='car_list.html';
                    break;
                case '化肥':
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
        $scope.buy_count++;
        $scope.buyCountChange($scope.buy_count);
    };
    $scope.buyCountChange = function(newValue){
        if(newValue == 0 || newValue == null || newValue == '' || parseInt(newValue) < 0 || isNaN(parseInt(newValue))){
            newValue = 1;
        }
        $scope.buy_count = parseInt(newValue);
    };
    $scope.buy = function(){
        var success_action = function(){
            var product = {};
            product.id = $scope.item.id;
            product.count = $scope.buy_count;
            var products = [];
            products.push(product);

            products = encodeURI(encodeURI(JSON.stringify(products)));
            // alert(products);
            window.location.href = 'confirmOrder.html?products=' + products;
        };
        addToShoppingCart(success_action);
    };
    $scope.addToShoppingCart = function(){
        var success_action = function(){
            alert('成功添加到购物车');
            window.location.href='';
        };
        addToShoppingCart(success_action);
    };
    $scope.show = function(index){
        for(var tabIndex in $scope.tabs){
            $scope.tabs[tabIndex].isSelected = false;
            $scope.tabs[tabIndex].show_div = false;
        }
        $scope.tabs[index].isSelected = true;
        $scope.tabs[tabIndex].show_div = true;
    };
    var addToShoppingCart = function(success_action){
        remoteApiService.addToShoppingCart($scope.item.id, $scope.buy_count, true)
            .then(function(data){
                if(data.code == 1000){
                    success_action();
                }
            })
    }
});