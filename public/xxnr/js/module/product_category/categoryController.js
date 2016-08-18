/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category', ['xxnr_common']);
app.controller('categoryController', function($scope, remoteApiService, commonService){
    var current_page = 1;
    var product_count_per_page = 20;
    $scope.$parent.select = function(categoryIndex, choiceIndex){
        for(var i in $scope.$parent.search_categories[categoryIndex].choices){
            $scope.$parent.search_categories[categoryIndex].choices[i].isSelected = false;
        }
        $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = true;
        $scope.$parent.search_categories[categoryIndex].current_query = $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].name;
        do_query();
    };
    var do_query = function(){
        queried_products = [];
        for(var itemIndex in all_products){
            if($scope.$parent.search_categories['brand'].current_query != '' && $scope.$parent.search_categories['brand'].current_query != '全部'){
                if(all_products[itemIndex].brand != $scope.$parent.search_categories['brand'].current_query){
                    continue;
                }
            }
            if($scope.$parent.search_categories['price'].current_query != '' && $scope.$parent.search_categories['price'].current_query != '全部'){
                var matches = $scope.$parent.search_categories['price'].current_query.match(/\d+/g);
                var lowPrice = matches.length > 0 ? matches[0] : 0;
                var highPrice = matches.length > 1 ? matches[1] : Number.MAX_VALUE;

                if(parseInt(all_products[itemIndex].nowPrice) < lowPrice || parseInt(all_products[itemIndex].nowPrice) > highPrice){
                    continue;
                }
            }
            queried_products.push(all_products[itemIndex]);
        }
        generate_page();
    };
    var generate_page = function(){
        $scope.$parent.pages = [];
        for(var id=1; id<=Math.ceil(queried_products.length / product_count_per_page); id++){
            $scope.$parent.pages.push({id:id, isSelected:false});
        }
        if($scope.$parent.pages.length >0) {
            $scope.$parent.pages[0].isSelected = true;
        }
        $scope.$parent.show_page(1);
    };

    var all_products = [];
    var queried_products = [];
    remoteApiService.getGoodsListPage(1, 200, $scope.$parent.categoryId)
        .then(function(data){
            for(var i in data.datas.rows[0].rows){
                var good = data.datas.rows[0].rows[i];
                var item = {};
                item.onSale = (good.unitPrice == null || good.unitPrice == '')? false:good.unitPrice!=good.originalPrice;
                item.name = good.goodsName;
                item.shortName = item.name.length>28?(item.name.substr(0, 22) + '...') : item.name;
                item.detailUrl = 'productDetail.html?goodsId='+good.goodsId+'&type='+data.datas.rows[0].typeName;
                item.imgUrl = commonService.baseUrl + good.thumbnail;
                item.nowPrice = item.onSale?good.unitPrice:good.originalPrice;
                item.oldPrice = good.originalPrice;
                item.brand = good.brandName;
                all_products.push(item);
            }
            queried_products = angular.copy(all_products);
            generate_page();
        });
    $scope.$parent.show_page = function(pageId){
        if(pageId!='...') {
            current_page = pageId;
            for (var pageIndex in $scope.$parent.pages) {
                if ($scope.$parent.pages[pageIndex].id == pageId) {
                    $scope.$parent.pages[pageIndex].isSelected = true;
                } else {
                    $scope.$parent.pages[pageIndex].isSelected = false;
                }
            }
            $scope.$parent.current_items = [];
            var fromGoodId = (pageId - 1) * product_count_per_page;
            var toGoodId = pageId * product_count_per_page - 1;
            for (var j = fromGoodId; j < queried_products.length && j <= toGoodId; j++) {
                $scope.$parent.current_items.push(queried_products[j]);
            }
        }
    };
    $scope.$parent.pre_page = function(){
        if(current_page>1){
            current_page--;
            $scope.$parent.show_page(current_page);
        }
    };
    $scope.$parent.next_page = function(){
        if(current_page<$scope.$parent.pages.length){
            current_page++;
            $scope.$parent.show_page(current_page);
        }
    }
});