/**
 * Created by pepelu on 9/16/2015.
 */
var app = angular.module('xxnr');
app.controller('indexController', function($scope, remoteApiService, commonService){
    $scope.articles = ['河南日报：新农人网络科技有限公司打造新新农人网络平台 ',
    '五句话解密新新农人 ',
    '网上购物要服务，新新农人来帮助！ ',
    '2015年你最关心的粮食补贴问题及解决办法 ',
    '农产品品牌危机当头，如何应对 ',
    '国家农业扶持项目申报一般的流程及技巧 '];

	//TODO: hot brands list from server
    $scope.brands = [{src:'images/brand1.png'},
        {src:'images/brand2.png'},
        {src:'images/brand3.png'},
        {src:'images/brand4.png'},
        {src:'images/brand5.png'},
        {src:'images/brand1.png'},
        {src:'images/brand2.png'},
        {src:'images/brand3.png'}];

	/*
    $scope.classes = {'49921c468feb4cc6bd69e5de0e1b9e15':{list:[], title:'农肥产品', classUrl:'huafei.html', imgUrl:"images/nongye.png"},
        '085c3dde0b5e413ab70e5f0a8dfd3c4c':{list:[], title:'汽车', classUrl:'car.html', imgUrl:"images/car.png"}};*/
	// {"name":"化肥","id":"531680A5","count":1,"url":"%E5%8C%96%E8%82%A5.html","imgUrl":"%E5%8C%96%E8%82%A5.jpg"}
	// $scope.classes = remoteApiService.getCategories();

    remoteApiService.getCategories().then(function(data){
        $scope.classes = data;

        for(var classIndex in $scope.classes){
            remoteApiService.getProducts(1, 8, $scope.classes[classIndex].id)
                .then(function(data){
                    var categoryIndex = 0;

                    for(var i in $scope.classes){
                        if($scope.classes[i].id == data.category){
                            categoryIndex = i;
                            break;
                        }
                    }

                    for(var i in data.products){
                        var product = data.products[i];
                        var categoryId = product.categoryId;
                        var item = {};
                        item.discount = product.discount || 1.0;
                        item.name = product.name;
                        item.shortName = item.name.length>28?(item.name.substr(0, 22) + '...') : item.name;
                        item.detailUrl = 'product-detail.html?id='+product.id+'&category='+ categoryId + '&type=' + $scope.classes[categoryIndex].name;
                        item.imgUrl = commonService.baseUrl + product.thumbnail;
                        item.price = product.price;
                        item.discountPrice = product.discountPrice;
                        item.hasDiscount = (0 < product.discount && product.discount < 1.0);
                        
                        if($scope.classes[categoryIndex].products === undefined) {
                            $scope.classes[categoryIndex].products = [];
                        }

                        $scope.classes[categoryIndex].products.push(item);
                    }
                });
        }
    });
});