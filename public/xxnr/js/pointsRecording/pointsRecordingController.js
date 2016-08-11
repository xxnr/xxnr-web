/**
 * Created by xxnr-cd on 16/8/11.
 */
/**
 * Created by cuidi on 15/11/6.
 */
var app = angular.module('pointRecording', ['xxnr_common','shop_cart',"ngFlash"]);
app.controller('pointsRecordingController', function($scope, remoteApiService, commonService, loginService, sideService, Flash){

    $scope.pointslogs = [];
    $scope.current_page = 1;
    $scope.pageCount = 0;

    $scope.getPointsLogs = function(page,max){
        remoteApiService.getPointsLogs(page,max)
            .then(function (data) {
                $scope.pointslogs = data.datas.pointslogs;
                angular.forEach($scope.pointslogs,function(pointslog){
                    pointslog.date_local = commonService.convertDateIncludeHMM(pointslog.date);
                    if(pointslog.description){
                        pointslog.description = pointslog.description.length > 28 ? (pointslog.description.substr(0, 25) + '...') : pointslog.description;
                    }else{
                        pointslog.description = "-";
                    }
                });
                $scope.pageCount = data.datas.pages;
                generate_page();
            })
    };
    $scope.getPointsLogs(1,20);
    var generate_page = function() {
        $scope.pages = [];
        for (var id = 1; id <= $scope.pageCount; id++) {
            $scope.pages.push({
                id: id,
                isSelected: false
            });
        }
        if ($scope.pages.length > 0) {
            $scope.pages[0].isSelected = true;
        }
        for (var pageIndex in $scope.pages) {
            if ($scope.pages[pageIndex].id == $scope.current_page) {
                $scope.pages[pageIndex].isSelected = true;
            } else {
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

    $scope.show_page = function(pageId) {
        if(pageId!='...') {
            $('html,body').animate({
                scrollTop: 0
            }, 100);
            $scope.current_page = pageId;
            for (var pageIndex in $scope.pages) {
                if ($scope.pages.hasOwnProperty(pageIndex)) {
                    if ($scope.pages[pageIndex].id == pageId) {
                        $scope.pages[pageIndex].isSelected = true;
                        $scope.getPointsLogs($scope.pages[pageIndex].id, 20);
                    } else {
                        $scope.pages[pageIndex].isSelected = false;
                    }
                }
            }
        }
    };


    $scope.pre_page = function() {
        if ($scope.current_page > 1) {
            $scope.current_page--;
            $scope.show_page($scope.current_page);
        }
    };
    $scope.next_page = function() {
        if ($scope.current_page < $scope.pageCount) {
            $scope.current_page++;
            $scope.show_page($scope.current_page);
        }
    };
});