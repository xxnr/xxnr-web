/**
 * Created by pepelu on 9/20/2015.
 */
var app=angular.module('xxnr');
app.controller('productDetailController',function($scope, remoteApiService, commonService){
    $scope.tabs=[{name:'商品详情', isSelected:true}, {name:'详情参数', isSelected:false}, {name:'买家评论', isSelected:false}, {name:'服务说明', isSelected:false}];
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
            item.detailUrl = 'product-detail.html?goodsId='+good.goodsId+'&type='+data.datas.rows[0].typeName;
            item.imgUrl = commonService.baseUrl + good.imgUrl;
            item.nowPrice = item.onSale?good.unitPrice:good.originalPrice;
            item.oldPrice = good.originalPrice;
            item.brand = good.brandName;
            item.detail = good.productDesc;
            item.canshu = good.standard;
            item.rate = good.goodsGreatCount;
            item.level = good.recommendedStar;

            $scope.item = item;

            for(var i=1; i<= item.level; i++){
                $scope.stars[i] = true;
            }
        });
    $scope.product_category = function(){
        switch($scope.category){
                case '农用车':
                    window.location.href='car.html';
                    break;
                case '化肥':
                    window.location.href='huafei.html';
                    break;
                default:
                    break;
            }
    };
    $scope.reduce = function(){
        if($scope.buy_count > 1){
            $scope.buy_count--;
        }
    };
    $scope.add = function(){
        $scope.buy_count++;
    };
    $scope.buy = function(){
        var success_action = function(){
            window.location.href='jiesuan.html';
        };
        addToShoppingCart(success_action);
    };
    $scope.addToShoppingCart = function(){
        var success_action = function(){
            alert('成功添加到购物车');
            window.location.href='shoppingCart.html';
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
        remoteApiService.addToShoppingCart($scope.item.id, $scope.buy_count)
            .then(function(data){
                if(data.code == 1000){
                    success_action();
                }
            })
    }
});