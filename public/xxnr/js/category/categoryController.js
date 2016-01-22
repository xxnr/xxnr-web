/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category', ['xxnr_common','shop_cart']);
app.controller('categoryController', function($scope, remoteApiService, commonService){
    var current_page = 1;
    var product_count_per_page = 20;
    $scope.pages_count = 0;
    var price;
    var brand;
    var model;
    var all_products = [];
    $scope.$parent.select = function(categoryIndex, choiceIndex){
        for(var i in $scope.$parent.search_categories[categoryIndex].choices){
            $scope.$parent.search_categories[categoryIndex].choices[i].isSelected = false;
        }

        $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = true;
        $scope.$parent.search_categories[categoryIndex].current_query = $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].name;

        current_page = 1;
        $scope.$parent.current_items = [];

        if($scope.$parent.search_categories['brand'].current_query != '' && $scope.$parent.search_categories['brand'].current_query != '全部'){
            brand = $scope.$parent.search_categories['brand'].current_query;
        }else{
            brand= "";
        }

        if($scope.$parent.search_categories['model'] && $scope.$parent.search_categories['model'].current_query != '' && $scope.$parent.search_categories['model'].current_query != '全部'){
            model = [];
            var _model = {};
            _model.name = "车系";
            _model.value = $scope.$parent.search_categories['model'].current_query;
            model.push(_model);
            console.log(typeof model);
            // [{"name":"车系","value":"和悦A30"},...]
        }else{
            model= "";
        }


        if($scope.$parent.search_categories['price'].current_query != '' && $scope.$parent.search_categories['price'].current_query != '全部'){
            var matches = $scope.$parent.search_categories['price'].current_query.match(/\d+/g);
            var lowPrice = matches.length > 0 ? matches[0] : 0;
            var highPrice = matches.length > 1 ? matches[1] : 10000000;
            price = lowPrice+","+highPrice;
        }else{
            price = "全部";
        }

        getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,brand,model,price);
        generate_page();
    };
    var generate_page = function(){
        $scope.$parent.pages = [];
        for(var id=1; id<=$scope.pages_count; id++){
            $scope.$parent.pages.push({id:id, isSelected:false});
        }
        if($scope.$parent.pages.length >0) {
            $scope.$parent.pages[0].isSelected = true;
        }
        for(var pageIndex in $scope.$parent.pages){
            if($scope.$parent.pages[pageIndex].id == current_page){
                $scope.$parent.pages[pageIndex].isSelected = true;
            }else {
                $scope.$parent.pages[pageIndex].isSelected = false;
            }
        }
    };
    var getPagedGoods = function(page,count_per_page,categoryId,brandName, modelName ,reservePrice){
        remoteApiService.getGoodsListPage(page, count_per_page, categoryId,brandName,modelName ,reservePrice)
            .then(function(data){
                all_products = [];
                $scope.pages_count = data.datas.pages;
                for(var i in data.datas.rows){
                    var good = data.datas.rows[i];
                    var item = {};

                    item.onSale = (good.unitPrice == null || good.unitPrice == '')? false:good.unitPrice!=good.originalPrice;
                    item.name = good.goodsName;
                    item.shortName = item.name.length>28?(item.name.substr(0, 22) + '...') : item.name;
                    item.detailUrl = 'productDetail.html?goodsId='+good.goodsId;
                    item.imgUrl = commonService.baseUrl + good.thumbnail;
                    item.nowPrice = item.onSale?good.unitPrice:good.originalPrice;
                    item.oldPrice = good.originalPrice;
                    item.brand = good.brandName;
                    item.model = good.model;
                    item.presale = good.presale;
                    all_products.push(item);

                }

                $scope.$parent.current_items = angular.copy(all_products);
                generate_page();

            });
    };

    $scope.$parent.show_page = function(pageId){
        current_page = pageId;
        for(var pageIndex in $scope.$parent.pages){
            if($scope.$parent.pages[pageIndex].id == pageId){
                $scope.$parent.pages[pageIndex].isSelected = true;
            }else {
                $scope.$parent.pages[pageIndex].isSelected = false;
            }
        }
        $scope.$parent.current_items = [];
        getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,brand,model,price);
    };
    getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId);

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
