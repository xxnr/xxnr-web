/**
 * Created by pepelu on 9/20/2015.
 */
var app=angular.module('news_detail', ['xxnr_common','shop_cart']);
app.controller('newsDetailController',function($scope, remoteApiService, commonService, $sce, sideService){
    var sweetalert = commonService.sweetalert;

    $scope.id = commonService.getParam('id');
    remoteApiService.getNewsCategories()
        .then(function(data) {
            $scope.categories = data.datas;
            remoteApiService.getNewsBody($scope.id)
                .then(function(data){
                    $scope.newsTitle = data.datas.title;
                    $scope.category = data.datas.category;
                    $scope.categoryId = findCategoryId($scope.category)+1;
                    $scope.newsAbstract = data.datas.abstract;
                    var d = new Date(commonService.parseDate(data.datas.datecreated));
                    $scope.createdDate = d.getFullYear()+'年'+ (d.getMonth()+1) +'月'+d.getDate()+'日';
                    $scope.newsBody = $sce.trustAsHtml(data.datas.newsbody);

                    remoteApiService.getNewsCategories()
                        .then(function(data) {
                            $scope.categories = data.datas;
                            $scope.categories.splice(0, 0, {name:'全部',linker:"全部"});
                            for(var i in $scope.categories){
                                $scope.categories[i].isSelected = false;
                            }
                            $scope.categories[0].isSelected = true;

                            remoteApiService.getSpecificNewsList('',5,1)
                                .then(function(articleList){
                                    $scope.sideArticles = [];
                                    $scope.pages_count = articleList.datas.pages;
                                    for(var index in articleList.datas.items){
                                        var article = {};
                                        article.name = articleList.datas.items[index].title;
                                        article.name = article.name.length > 35 ? (article.name.substr(0, 35) + '...') : article.name;
                                        article.id = articleList.datas.items[index].id;
                                        article.url = "newsDetail.html?id="+article.id;
                                        article.category = articleList.datas.items[index].category;
                                        article.categoryId = findCategoryId(article.category);
                                        var d = new Date(articleList.datas.items[index].datecreated);
                                        article.createdTime = d.getFullYear()+'-'+ (d.getMonth()+1) +'-'+d.getDate();
                                        $scope.sideArticles.push(article);
                                    }
                                });
                        });
                });

        });


    function findCategoryId(categoryNameStr){
        for(var i = 0; i<$scope.categories.length; i++) {
            if($scope.categories[i].name==categoryNameStr){
                return i;
            }
        }
    }
});