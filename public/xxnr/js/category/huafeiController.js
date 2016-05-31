/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category');
app.controller('huafeiController', function($scope, remoteApiService, sideService) {
    $scope.categoryId = '531680A5';
    $scope.brandsStr = '';
    var brands = [];
    // var brands = [{name:'全部', isSelected:true}];
    remoteApiService.getBrands($scope.categoryId)
        .then(function(data) {
            for (var i = 0; i < data.brands.length; i++) {
                data.brands[i].isSelected = false;
                brands.push(data.brands[i]);
            }
        });
    var price_ranges = [{
        name: '0~1000元',
        isSelected: false
    }, {
        name: '1000~2000元',
        isSelected: false
    }, {
        name: '2000~3000元',
        isSelected: false
    }, {
        name: '3000元以上',
        isSelected: false
    }];
    $scope.search_categories = [
        {
            name: '品牌',
            index: 'brand',
            choices: brands,
            current_query: ''
        },
        {
            name: '价格（每吨）',
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
                if($scope.search_categories && $scope.search_categories.length > 2){
                    var s_c = $scope.search_categories;
                    $scope.search_categories = Array(s_c[0],s_c[s_c.length-1]);
                }
                for(var i in attributes) {
                    if (attributes.hasOwnProperty(i)) {
                        var attributes_choices = [];
                        for (var j = 0; j < attributes[i].values.length; j++) {
                            var choice = {};
                            choice.name = attributes[i].values[j];
                            choice.isSelected = false;
                            attributes_choices.push(choice);
                        }

                        $scope.search_categories.splice(-1, -1,
                            {
                                name: attributes[i]._id.name,
                                index: attributes[i]._id.name,
                                choices: attributes_choices,
                                current_query: []
                            });
                    }
                }
            });
    };
    $scope.getSelectedBrands = function(brands,isInitial){
        var result = [];
        for(var i in brands){
            if(brands.hasOwnProperty(i)) {
                if (isInitial) {
                    result.push(brands[i]._id);
                } else {
                    if (brands[i].isSelected === true) {
                        result.push(brands[i]._id);
                    }
                }
            }
        }
        return result;
    };
    $scope.stringifyBrands = function(strArray,isPublicAttributes){
        var result = "";
        for(var i in strArray){
            if(strArray.hasOwnProperty(i)) {
                result = result + strArray[i] + ',';
            }
        }
        if(isPublicAttributes){
            result = result + "0,";
        }
        return result;
    };
    $scope.getAttributes(true,true);
});
