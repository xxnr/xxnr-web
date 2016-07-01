/**
 * Created by xxnr-cd on 15/12/16.
 */
var app = angular.module('news', ['xxnr_common', 'shop_cart']);
app.controller('newsController', function($scope,remoteApiService,sideService){
    $scope.tabNum = 0;
    $scope.indexTabNum = 0;

    $scope.current_page = 1;
    var current_category = '全部';
    $scope.articles = [];
    $scope.categories = [];
    $scope.uptodateArticles = [];
    var newsPerpage = 15;

    var generate_page = function(){
        $scope.pages = [];
        for(var id=1; id<=$scope.pages_count; id++){
            $scope.pages.push({id:id, isSelected:false});
        }

        if($scope.pages.length >0) {
            $scope.pages[0].isSelected = true;
        }
        for(var pageIndex in $scope.pages){
            if($scope.pages[pageIndex].id == $scope.current_page){
                $scope.pages[pageIndex].isSelected = true;
            }else {
                $scope.pages[pageIndex].isSelected = false;
            }
        }
        if($scope.pages.length<=7){                                                     // e.g.: 1 2 3 4 5 6 7
            $scope.pages = $scope.pages;
        }else if($scope.pages.length>7 && $scope.current_page<5){                              // e.g.: 1 2 3 4 5 ... 20
            $scope.pages = $scope.pages.slice(0,6).concat($scope.pages[$scope.pages.length-1]);
            $scope.pages[5].id = '...';
        }else if($scope.pages.length>7 && $scope.current_page <= $scope.pages_count && $scope.current_page> $scope.pages_count - 4 ) {    // e.g.: 1 ... 16 17 18 19 20
            $scope.pages = $scope.pages.slice(0,1).concat($scope.pages.slice($scope.pages.length-6,$scope.pages.length));
            $scope.pages[1].id = '...';
        }else{                                                                          // e.g.: 1 .. 8 9 10 ... 20
            var tempFirst = $scope.pages[0];
            var tempLast = $scope.pages[$scope.pages.length-1];
            $scope.pages = $scope.pages.slice($scope.current_page-3,$scope.current_page+2);
            $scope.pages[0].id = '...';
            $scope.pages[$scope.pages.length-1].id = '...';
            $scope.pages.push(tempLast);
            $scope.pages.unshift(tempFirst);
        }
    };


    $scope.selectTab = function(categoryIndex){
        for(var i in $scope.categories){
            $scope.categories[i].isSelected = false;
        }
        $scope.categories[categoryIndex].isSelected = true;

        $scope.current_page = 1;
        $scope.articles = [];
        current_category = $scope.categories[categoryIndex].name;
        getAllNewsList($scope.categories[categoryIndex].name=='全部'?'':$scope.categories[categoryIndex].name,newsPerpage,$scope.current_page);
        generate_page();
    };

    var getAllNewsList = function(categoryName,numPerPage,pageNum){
        remoteApiService.getSpecificNewsList(categoryName,numPerPage,pageNum)
            .then(function(articleList){
                $scope.articles = [];
                $scope.pages_count = articleList.datas.pages;
                generate_page();
                for(var index in articleList.datas.items){
                    if(articleList.datas.items.hasOwnProperty(index)){
                        var article = {};
                        article.name = articleList.datas.items[index].title;
                        article.name = article.name.length > 80 ? (article.name.substr(0, 80) + '...') : article.name;
                        article.id = articleList.datas.items[index].id;
                        article.url = "newsDetail.html?id="+article.id;
                        article.tabNum = index;
                        article.imageUrl = articleList.datas.items[index].image;
                        article.category = articleList.datas.items[index].category;
                        var d = Date.fromISO(articleList.datas.items[index].datecreated);
                        article.createdTime = d.getFullYear().toString()+'年'+ (d.getMonth()+1).toString() +'月'+d.getDate().toString()+'日';
                        article.abstract = articleList.datas.items[index].newsabstract;
                        article.abstract = article.abstract.length > 90 ? (article.abstract.substr(0, 90) + '...') : article.abstract;
                        $scope.articles.push(article);
                    }

                }
            });
    };



    if(window.location.pathname.indexOf('news_list')!=-1){
        remoteApiService.getNewsCategories()
            .then(function(data) {
                if (data && data.datas) {
                    for(var i in data.datas){
                        $scope.categories[i] = data.datas[i];
                        $scope.categories[i].isSelected = false;
                    }
                }
                $scope.categories.splice(0, 0, {name:'全部',linker:"全部"});
                $scope.categories[0].isSelected = true;

                if(Number(location.search[5]) | Number(location.search[5])===0) {
                    $scope.selectTab(location.search[5]);
                }else{
                    getAllNewsList('',newsPerpage,1);
                }
                remoteApiService.getSpecificNewsList('',5,1)
                    .then(function(articleList){
                        $scope.sideArticles = [];
                        for(var index in articleList.datas.items){
                            if(articleList.datas.items.hasOwnProperty(index)){
                                var article = {};
                                article.name = articleList.datas.items[index].title;
                                article.name = article.name.length > 35 ? (article.name.substr(0, 35) + '...') : article.name;
                                article.id = articleList.datas.items[index].id;
                                article.url = "newsDetail.html?id="+article.id;
                                article.category = articleList.datas.items[index].category;
                                article.categoryId = findCategoryId(article.category);
                                var d = Date.fromISO(articleList.datas.items[index].datecreated);
                                article.createdTime = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString();
                                $scope.sideArticles.push(article);
                            }

                        }
                    });
            });

    }else{
        remoteApiService.getNewsCategories()
            .then(function(data) {
                $scope.categories = data.datas;
                $scope.categories.splice(0, 0, {name:'最新资讯',linker:"最新资讯"});
                remoteApiService.getSpecificNewsList('',4,1)
                    .then(function(articleList){
                        for(var index in articleList.datas.items){
                            if(articleList.datas.items.hasOwnProperty(index)){
                                var article = {};
                                article.name = articleList.datas.items[index].title;
                                article.name = article.name.length > 35 ? (article.name.substr(0, 35) + '...') : article.name;
                                article.id = articleList.datas.items[index].id;
                                article.url = "newsDetail.html?id="+article.id;
                                article.imageUrl = articleList.datas.items[index].image;
                                article.category = '最新资讯';
                                //console.log(article.category);
                                article.tabNum = 0;
                                article.createdTime = articleList.datas.items[index].datecreated;
                                $scope.articles.push(article);
                            }

                        }
                    });
                for(var i = 1; i<$scope.categories.length; i++){
                    // home page news max category
                    if (i > 4) {
                        break;
                    }
                    remoteApiService.getNewsList($scope.categories[i].name)
                        .then(function(articleList){
                            for(var index in articleList.datas.items){
                                if(articleList.datas.items.hasOwnProperty(index)){
                                    var article = {};
                                    article.name = articleList.datas.items[index].title;
                                    article.name = article.name.length > 35 ? (article.name.substr(0, 35) + '...') : article.name;
                                    article.id = articleList.datas.items[index].id;
                                    article.url = "newsDetail.html?id="+article.id;
                                    article.imageUrl = articleList.datas.items[index].image;
                                    article.category = articleList.datas.items[index].category;
                                    article.tabNum = findCategoryId(article.category);
                                    //console.log(article.category);
                                    article.createdTime = articleList.datas.items[index].datecreated;
                                    $scope.articles.push(article);
                                }

                            }
                        });
                }
            });
    }



    $scope.show_page = function(pageId){
        $('html,body').animate({
            scrollTop: 0
        }, 100);
        //console.log(pageId);
        if(pageId!='...'){
            $scope.current_page = pageId;
            for(var pageIndex in $scope.pages){
                if($scope.pages[pageIndex].id == pageId){
                    $scope.pages[pageIndex].isSelected = true;
                }else {
                    $scope.pages[pageIndex].isSelected = false;
                }
            }
            $scope.articles = [];
            generate_page();
            getAllNewsList(current_category=='全部'?'':current_category,newsPerpage,$scope.current_page);
        }
    };

    function findCategoryId(categoryNameStr){
        for(var i = 0; i<$scope.categories.length; i++) {
            //console.log(categoryNameStr);
            if($scope.categories[i].name==categoryNameStr){
                return i;
            }
        }
    }

    $scope.pre_page = function(){
        if($scope.current_page>1){
            $scope.current_page--;
            $scope.show_page($scope.current_page);
        }
    };

    $scope.next_page = function(){
        if($scope.current_page<$scope.pages_count){
            $scope.current_page++;
            $scope.show_page($scope.current_page);
        }
    };

});
