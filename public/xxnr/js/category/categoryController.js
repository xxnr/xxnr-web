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
    var queryAttributes = [];
    var all_products = [];
    var hasAttributes = false;

    $scope.$parent.select = function(categoryIndex, choiceIndex){
        $scope.$parent.brandsStr = null;
        if(categoryIndex== ($scope.$parent.search_categories.length - 1)){
            if($scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected == true){
                $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = false;
                $scope.$parent.search_categories.slice(-1)[0].current_query = "";
            }else{
                for(var i in $scope.$parent.search_categories[categoryIndex].choices){
                    $scope.$parent.search_categories[categoryIndex].choices[i].isSelected = false;
                }
                $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = true;
                $scope.$parent.search_categories[categoryIndex].current_query = $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].name;
            }
        }else{
            $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = !$scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected;
            // $scope.$parent.search_categories[categoryIndex].current_query.push($scope.$parent.search_categories[categoryIndex].choices[choiceIndex].name);
            if(categoryIndex === 0){
                // var brandsStr = $scope.$parent.getSelectedBrands($scope.$parent.search_categories[categoryIndex].choices,false);
                // brandsStr = $scope.$parent.stringifyBrands(brandsStr,false).slice(0,-1);
                $scope.$parent.getAttributes(false,true);
            }
        }
        $scope.$parent.brandsStr = $scope.getSelectedBrands($scope.search_categories[0].choices,false);
        $scope.$parent.brandsStr = $scope.stringifyBrands($scope.brandsStr,false).slice(0,-1);
        if(!$scope.$parent.brandsStr){
            $scope.$parent.brandsStr = null;
        }
        current_page = 1;
        $scope.$parent.current_items = [];

        queryAttributes = [];
        hasAttributes = false;

        for(var j = 1;j<$scope.$parent.search_categories.length-1;j++){
            var a = {
                name:"",
                value:
                {
                    '$in':[]
                }
            };
            for(var k in $scope.$parent.search_categories[j].choices){
                if($scope.$parent.search_categories[j].choices[k].isSelected === true){
                    a.name = $scope.$parent.search_categories[j].name;
                    // console.log($scope.$parent.search_categories[j].choices[k].name);
                    // console.log(a.value);
                    a.value['$in'].push($scope.$parent.search_categories[j].choices[k].name);
                    hasAttributes = true;
                }

            }
            if(a.name){
                queryAttributes.push(a);
            }

        }

        // console.log(queryAttributes);
        if(!hasAttributes){
            queryAttributes = null;
        }


        if($scope.$parent.search_categories.slice(-1)[0].current_query != '' && $scope.$parent.search_categories.slice(-1)[0].current_query != '全部'){
            var matches = $scope.$parent.search_categories.slice(-1)[0].current_query.match(/\d+/g);
            var lowPrice = matches.length > 0 ? matches[0] : 0;
            var highPrice = matches.length > 1 ? matches[1] : 10000000;
            price = lowPrice+","+highPrice;
        }else{
            price = null;
        }
        // console.log(queryAttributes);
        console.log(price);
        getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,$scope.$parent.brandsStr, queryAttributes, price);
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
    var getPagedGoods = function(page,count_per_page,categoryId,brandsStr, queryAttributesArray ,reservePrice){
        remoteApiService.getGoodsListPage(page, count_per_page, categoryId,brandsStr,queryAttributesArray ,reservePrice)
            .then(function(data){
                all_products = [];
                $scope.pages_count = data.datas.pages;
                for(var i in data.datas.rows){
                    var good = data.datas.rows[i];
                    var item = {};

                    item.onSale = (good.unitPrice == null || good.unitPrice == '')? false:good.unitPrice!=good.originalPrice;
                    item.name = good.goodsName;
                    item.shortName = item.name.length>28?(item.name.substr(0, 20) + '...') : item.name;
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
    };
});
