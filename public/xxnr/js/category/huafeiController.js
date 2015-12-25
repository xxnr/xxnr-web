/**
 * Created by pepelu on 9/19/2015.
 */
var app = angular.module('product_category');
app.controller('huafeiController', function($scope,remoteApiService,sideService){
    $scope.categoryId = '531680A5';
    var brandStr = "brands";
    var brands = [{name:'全部', isSelected:true}];
    remoteApiService.getProductsTabs($scope.categoryId,brandStr)
        .then(function(data) {
            for(var i=0;i<data.datas.length;i++){
                data.datas[i].isSelected = false;
                brands.push(data.datas[i]);
            }
        });
    var price_ranges =
            [{name:'全部', isSelected:true},
            {name:'0~1000元', isSelected:false},
            {name:'1000~2000元', isSelected:false},
            {name:'2000~3000元', isSelected:false},
            {name:'3000元以上', isSelected:false}
            ];
    $scope.search_categories = {brand:{name:'品牌', index: 'brand', choices:brands, current_query:''}, price:{name:'价格（每吨）', index:'price', choices:price_ranges, current_query:''}};
});