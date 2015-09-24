/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('xxnr');
app.controller('carController', function($scope){
    $scope.categoryId = '085c3dde0b5e413ab70e5f0a8dfd3c4c';
    var brands = [{name:'全部', isSelected:true}, {name:'时风', isSelected:false}];
    var price_ranges = [{name:'全部', isSelected:true}, {name:'0~50000元', isSelected:false}, {name:'50000~60000元', isSelected:false}, {name:'60000~70000元', isSelected:false},
        {name:'70000元以上', isSelected:false}];
    $scope.search_categories = {brand:{name:'品牌', index: 'brand', choices:brands, current_query:''}, price:{name:'价格', index:'price', choices:price_ranges, current_query:''}};
});