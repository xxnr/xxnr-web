/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category');
app.controller('carController', function($scope, remoteApiService, sideService) {
    $scope.categoryId = '6C7D8F66';    //汽车ID
    $scope.brandsStr = '';             //所选品牌的字符串
    var brands = [];
    var attributes = [];

    remoteApiService.getBrands($scope.categoryId)
        .then(function(data) {
            for (var i = 0; i < data.brands.length; i++) {
                data.brands[i].isSelected = false;
                brands.push(data.brands[i]);
            }
        });

    var price_ranges = [{           //写死的价格区间
        name: '0~50000元',
        isSelected: false
    }, {
        name: '50000~60000元',
        isSelected: false
    }, {
        name: '60000~70000元',
        isSelected: false
    }, {
        name: '70000元以上',
        isSelected: false
    }];
    $scope.search_categories = [           //筛选项
        {
            name: '品牌',
            index: 'brand',
            choices: brands,
            current_query: []
        },
        {
            name: '价格',
            index: 'price',
            choices: price_ranges,
            current_query: ''
        }
    ];

    $scope.getAttributes = function(isInitial,isPublicAttributes) {
        $scope.brandsStr = $scope.getSelectedBrands($scope.search_categories[0].choices,isInitial);
        $scope.brandsStr = $scope.stringifyBrands($scope.brandsStr,isPublicAttributes).slice(0,-1);
        remoteApiService.getAttributes($scope.categoryId, $scope.brandsStr)
            .then(function(data) {
                attributes = data.attributes;
                // console.log(attributes);
                if($scope.search_categories.length > 2){
                    var s_c = $scope.search_categories;
                    $scope.search_categories = Array(s_c[0],s_c[s_c.length-1]);
                }
                for(var i in attributes){
                    var attributes_choices = [];
                    for (var j = 0; j < attributes[i].values.length; j++) {
                        var choice = {};
                        choice.name = attributes[i].values[j];
                        choice.isSelected = false;
                        attributes_choices.push(choice);
                    }

                    $scope.search_categories.splice(-1,-1,
                        {
                            name: attributes[i]._id.name,
                            index: attributes[i]._id.name,
                            choices: attributes_choices,
                            current_query: []
                        });
                }

            });
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
    $scope.getAttributes(true,true);
});
