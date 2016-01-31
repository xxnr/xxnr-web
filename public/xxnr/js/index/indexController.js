/**
 * Created by pepelu on 9/16/2015.
 */
var app = angular.module('index', ['xxnr_common','news','shop_cart']);

app.controller('indexController', function($scope, remoteApiService, commonService, loginService){

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
     $scope.classes = {'49921c468feb4cc6bd69e5de0e1b9e15':{list:[], title:'农肥产品', classUrl:'huafei_list.html', imgUrl:"images/nongye.png"},
     '085c3dde0b5e413ab70e5f0a8dfd3c4c':{list:[], title:'汽车', classUrl:'car_list.html', imgUrl:"images/car.png"}};*/
    // {"name":"化肥","id":"531680A5","count":1,"url":"%E5%8C%96%E8%82%A5.html","imgUrl":"%E5%8C%96%E8%82%A5.jpg"}
    // $scope.classes = remoteApiService.getCategories();

    //$scope.classes = [{title:'化肥',url:'huafei_list.html',imgUrl:'images/huafei_side.png'},{title:'汽车',url:'car_list.html',imgUrl:'images/huafei_side.png'}];
    remoteApiService.getCategories().then(function(data){

        // show 化肥 first
        data.categories.sort(function(a,b){
            if(a.name=='汽车'){
                return -1;
            }
            if(b.name=='汽车'){
                return 1;
            }
        });
        $scope.classes = data.categories;
        for(var c in $scope.classes){
            //c['imgUrl'].replace('/','/_new');
            $scope.classes[c].imgUrl = 'images/new_' + $scope.classes[c].id + '.png';
            //$scope.classes[c].imgUrl = $scope.classes[c].imgUrl.replace('/','/new_');
            //console.log($scope.classes[c].imgUrl);
        }

        for(var classIndex in $scope.classes) {
            console.log($scope.classes[classIndex].id);
            remoteApiService.getProducts(1, 8, $scope.classes[classIndex].id)
                .then(function (data) {
                    var categoryIndex = 0;

                    for (var i in $scope.classes) {
                        if ($scope.classes[i].id == data.category) {
                            categoryIndex = i;
                            break;
                        }
                    }

                    for (var i in data.products) {
                        var product = data.products[i];
                        var item = {};
                        item.discount = product.discount || 1.0;
                        item.name = product.defaultSKU.name;
                        item.id = product.defaultSKU.ref;
                        item.shortName = item.name.length > 36 ? (item.name.substr(0, 33) + '...') : item.name;
                        item.detailUrl = 'productDetail.html?id=' + product.id;
                        item.imgUrl = commonService.baseUrl + product.thumbnail;
                        item.price = product.defaultSKU.price?product.defaultSKU.price.platform_price:product.price;
                        item.discountPrice = product.discountPrice;
                        item.hasDiscount = (0 < product.discount && product.discount < 1.0);
                        item.presale = product.presale;
                        if ($scope.classes[categoryIndex].products === undefined) {
                            $scope.classes[categoryIndex].products = [];
                        }

                        $scope.classes[categoryIndex].products.push(item);
                    }

                });
        }
    });

    $scope.index_AddToShoppingCart = function(id,presale,event){
        if(!presale){
            remoteApiService.addToShoppingCart(id, 1,[] ,true)
                .then(function(data){
                    if(data.code == 1000){
                        //console.log(id);
                        $scope.$broadcast('shoppingCartController', 1);

                        if(loginService.isLogin) {
                            var offset = $("#side_shoping_cart").offset();

                            //console.log('click!!!!!!!!!');
                            //
                            //console.log('offset.left'+offset.left);
                            //console.log('offset.top'+offset.top);
                            var addcar = $(this);
                            var img = $(event.currentTarget).parent().find('img').attr('src');
                            console.log(event.currentTarget);
                            var flyer = $('<img class="u-flyer" src="' + img + '">');
                            flyer.fly({
                                start: {
                                    left: event.pageX,
                                    top: event.screenY - 80
                                },
                                end: {
                                    left: offset.left,
                                    top: offset.top - $(window).scrollTop(),
                                    width: 0,
                                    height: 0
                                },
                                speed: 1.4,
                                onEnd: function () {
                                    //                        $("#msg").show().animate({width: '250px'}, 200).fadeOut(1000);
                                    //                        addcar.css("cursor","default").removeClass('orange').unbind('click');
                                    this.destory();
                                }
                            });
                        }

                    }
                })
        }
    };

});
