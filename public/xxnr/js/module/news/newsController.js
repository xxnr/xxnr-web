/**
 * Created by pepelu on 9/21/2015.
 */
var app = angular.module('news');
app.controller('newsController', function($scope){
    $scope.articles = [
        {name:'河南日报：新农人网络科技有限公司打造新新农人网络平台 ',url:'resources/article/article_1.html'},
        {name:'五句话解密新新农人 ',url:'resources/article/article_2.html'},
        {name:'网上购物要服务，新新农人来帮助！ ',url:'resources/article/article_3.html'},
        {name:'2015年你最关心的粮食补贴问题及解决办法 ',url:'resources/article/article_4.html'},
        {name:'农产品品牌危机当头，如何应对 ',url:'resources/article/article_5.html'},
        {name:'国家农业扶持项目申报一般的流程及技巧 ',url:'resources/article/article_6.html'}
    ];
    $scope.show = function(index){
        window.open($scope.articles[index].url);
    }
});