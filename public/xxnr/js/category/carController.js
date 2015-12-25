/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category');
app.controller('carController', function($scope,remoteApiService,sideService){
    $scope.categoryId = '6C7D8F66';
    var brandStr = "brands";
    var modelsStr = "models";
    var brands = [{name:'全部', isSelected:true}];
    var models = [{name:'全部', isSelected:true}];
    remoteApiService.getProductsTabs($scope.categoryId,brandStr)
        .then(function(data) {
            for(var i=0;i<data.datas.length;i++){
                data.datas[i].isSelected = false;
                brands.push(data.datas[i]);
            }
        });
    remoteApiService.getProductsTabs($scope.categoryId,modelsStr)
        .then(function(data) {
            for(var i=0;i<data.datas.length;i++){
                data.datas[i].isSelected = false;
                models.push(data.datas[i]);
            }
        });
    var price_ranges = [{name:'全部', isSelected:true}, {name:'0~50000元', isSelected:false}, {name:'50000~60000元', isSelected:false}, {name:'60000~70000元', isSelected:false},
        {name:'70000元以上', isSelected:false}];
    $scope.search_categories = {brand:{name:'品牌', index: 'brand', choices:brands, current_query:''}, price:{name:'价格', index:'price', choices:price_ranges, current_query:''}, model:{name:'车系', index:'model', choices:models, current_query:''}};
});