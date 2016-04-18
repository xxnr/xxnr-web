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
    var attributes = [];

    $scope.$parent.select = function(categoryIndex, choiceIndex){
        $scope.$parent.brandsStr = null;                //用来QUERY的品牌的字符串

        if(categoryIndex== ($scope.$parent.search_categories.length - 1)){     //选中价格那一行的属性
            if($scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected == true){ //原来是选中状态时
                $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = false;
                $scope.$parent.search_categories.slice(-1)[0].current_query = "";
            }else{   //原来是非选中状态时
                for(var i in $scope.$parent.search_categories[categoryIndex].choices){
                    $scope.$parent.search_categories[categoryIndex].choices[i].isSelected = false;
                }
                $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = true;
                $scope.$parent.search_categories[categoryIndex].current_query = $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].name;
            }
        }else{     //选中其他行时
            $scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected = !$scope.$parent.search_categories[categoryIndex].choices[choiceIndex].isSelected;
        }
        $scope.$parent.brandsStr = $scope.getSelectedBrands($scope.$parent.search_categories[0].choices,false);
        $scope.$parent.brandsStr = $scope.stringifyBrands($scope.brandsStr,false).slice(0,-1);
        if(!$scope.$parent.brandsStr){
            $scope.$parent.brandsStr = null;
        }
        current_page = 1;
        $scope.$parent.current_items = [];
        queryAttributes = [];
        hasAttributes = false;

        if(categoryIndex === 0) {
            $scope.$parent.brandsStr = $scope.getSelectedBrands($scope.$parent.search_categories[0].choices,false);
            $scope.$parent.brandsStr = $scope.stringifyBrands($scope.$parent.brandsStr,true).slice(0,-1);
            remoteApiService.getAttributes($scope.$parent.categoryId, $scope.$parent.brandsStr)
                .then(function (data) {
                    attributes = data.attributes;
                    var old_search_categories = $scope.$parent.search_categories;
                    if ($scope.$parent.search_categories.length > 2) {
                        var s_c = $scope.$parent.search_categories;
                        $scope.$parent.search_categories = Array(s_c[0], s_c[s_c.length - 1]);
                    }
                    for (var i in attributes) {
                        var attributes_choices = [];
                        for (var y = 0; y < attributes[i].values.length; y++) {
                            var choice = {};
                            choice.name = attributes[i].values[y];
                            choice.isSelected = false;
                            for (var k = 1; k < old_search_categories.length-1; k++) {
                                for (var x = 0; x < old_search_categories[k].choices.length; x++) {
                                    if (old_search_categories[k].choices[x].name == choice.name && old_search_categories[k].choices[x].isSelected) {
                                        choice.isSelected = true;
                                    }
                                }
                            }
                            attributes_choices.push(choice);
                        }
                        $scope.$parent.search_categories.splice(-1, -1,
                            {
                                name: attributes[i]._id.name,
                                index: attributes[i]._id.name,
                                choices: attributes_choices,
                                current_query: []
                            });

                    }
                    console.log($scope.$parent.search_categories);
                    for(var j = 1;j<$scope.$parent.search_categories.length-1;j++){   //生成queryAttribute 的字符串
                        var a = {
                            name:"",
                            value:
                            {
                                '$in':[]
                            }
                        };
                        for(var z in $scope.$parent.search_categories[j].choices){
                            if($scope.$parent.search_categories[j].choices[z].isSelected === true){
                                a.name = $scope.$parent.search_categories[j].name;
                                a.value['$in'].push($scope.$parent.search_categories[j].choices[z].name);
                                hasAttributes = true;
                            }

                        }
                        if(a.name){
                            queryAttributes.push(a);
                        }
                    }
                    //console.log(queryAttributes);
                    if(!hasAttributes){
                        queryAttributes = [];
                    }
                    $scope.$parent.brandsStr = $scope.getSelectedBrands($scope.$parent.search_categories[0].choices,false);
                    $scope.$parent.brandsStr = $scope.stringifyBrands($scope.$parent.brandsStr,false).slice(0,-1);

                    if($scope.$parent.search_categories.slice(-1)[0].current_query != '' && $scope.$parent.search_categories.slice(-1)[0].current_query != '全部'){
                        var matches = $scope.$parent.search_categories.slice(-1)[0].current_query.match(/\d+/g);
                        var lowPrice = matches.length > 0 ? matches[0] : 0;
                        var highPrice = matches.length > 1 ? matches[1] : 10000000;
                        price = lowPrice+","+highPrice;
                    }else{
                        price = null;
                    }
                    getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,$scope.$parent.brandsStr, queryAttributes.length==0?null:queryAttributes, price);
                    generate_page();
                });
        }
        else{
            for(var j = 1;j<$scope.$parent.search_categories.length-1;j++){   //生成queryAttribute 的字符串
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
                        a.value['$in'].push($scope.$parent.search_categories[j].choices[k].name);
                        hasAttributes = true;
                    }

                }
                if(a.name){
                    queryAttributes.push(a);
                }
            }
            if(!hasAttributes){
                queryAttributes = [];
            }
            $scope.$parent.brandsStr = $scope.getSelectedBrands($scope.$parent.search_categories[0].choices,false);
            $scope.$parent.brandsStr = $scope.stringifyBrands($scope.$parent.brandsStr,false).slice(0,-1);

            if($scope.$parent.search_categories.slice(-1)[0].current_query != '' && $scope.$parent.search_categories.slice(-1)[0].current_query != '全部'){
                var matches = $scope.$parent.search_categories.slice(-1)[0].current_query.match(/\d+/g);
                var lowPrice = matches.length > 0 ? matches[0] : 0;
                var highPrice = matches.length > 1 ? matches[1] : 10000000;
                price = lowPrice+","+highPrice;
            }else{
                price = null;
            }
            getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,$scope.$parent.brandsStr, queryAttributes.length==0?null:queryAttributes, price);
            generate_page();
        }





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
        if(!hasAttributes){
            queryAttributes = [];
        }
        if(!price){
            prive = null;
        }
        if($scope.$parent.brandsStr == 0){
            $scope.$parent.brandsStr = null;
        }

        remoteApiService.getGoodsListPage(page, count_per_page, categoryId,brandsStr,queryAttributesArray ,reservePrice)
            .then(function(data){
                all_products = [];
                $scope.pages_count = data.datas.pages;
                for(var i in data.datas.rows){
                    if(data.datas.rows.hasOwnProperty(i)){
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
        getPagedGoods(current_page,product_count_per_page,$scope.$parent.categoryId,$scope.$parent.brandsStr, queryAttributes, price);
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
    $scope.getSelectedBrands = function(brands,isInitial){
        var result = [];
        for(var i in brands){
            if(isInitial){
                result.push(brands[i]._id);
            }else{
                if(brands[i].isSelected === true){
                    result.push(brands[i]._id);
                }
            }
        }
        return result;
    };
    $scope.stringifyBrands = function(strArray,isPublicAttributes){
        var result = "";
        for(var i in strArray){
            result = result + strArray[i]+',';
        }
        if(isPublicAttributes){
            result = result + "0,";
        }
        return result;
    };
});
