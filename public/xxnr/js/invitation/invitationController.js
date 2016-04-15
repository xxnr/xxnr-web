/**
 * Created by cuidi on 15/11/6.
 */
var app = angular.module('invitation', ['xxnr_common','shop_cart']);
app.controller('invitationController', function($scope, remoteApiService, commonService, loginService, sideService){
    var _user = commonService.user;
    var sweetalert = commonService.sweetalert;
    var sweetConfirm = commonService.sweetConfirm;
    var firstLoadPage = true;
    $scope.InviteeOrders = [];
    $scope.confirm = false;
    $scope.tabNum = 1;
    $scope.showOrders = false;
    $scope.current_page = 1;
    var ordersPerPage = 20;
    var selectedInviteeId = '';
    if(Number(location.search[5]) | Number(location.search[5])===0) {
        $scope.tabNum = Number(location.search[5]);
    }

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

    remoteApiService.getInvitee()
        .then(function (data) {
            $scope.invitees = data.invitee;
            for(var index in $scope.invitees){
                if($scope.invitees.hasOwnProperty(index)){
                    var d = Date.fromISO($scope.invitees[index].dateinvited);
                    $scope.invitees[index].dateinvited = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString();
                }
            }
        });

    $scope.inviterPhoneNumberValidated = false;
    $scope.$watch('inviterNum',function(){
        if(!isNaN($scope.inviterNum) && /*/^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/*/ /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test($scope.inviterNum)){
            remoteApiService.findAccount($scope.inviterNum)
                .then(function (data) {
                    if(data.code == 1000){
                        $scope.phoneNumberValidated = true;
                    }else{
                        $scope.phoneNumberValidated = false;
                    }
                })

        }else{
            $scope.phoneNumberValidated = false;
        }
    });

    $scope.$watch('tab',function(){
        remoteApiService.getBasicUserInfo()
            .then(function (data) {
                $scope.inviter = data.datas.inviter;
                if($scope.tab == 2 && firstLoadPage && !$scope.inviter){
                    firstLoadPage = false;
                    remoteApiService.getNominatedInviter()
                        .then(function (data) {
                            var nominated_inviter = data.nominated_inviter;
                            if(data.code==1000){
                                if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i) == "8.") {
                                    var r = confirm("是否要添加该用户为您的代表？\n" + nominated_inviter.name + "   " + nominated_inviter.phone);
                                    if (r == true) {
                                        remoteApiService.bindInviter(nominated_inviter.phone)
                                            .then(function (data) {
                                                if (data.code == 1000) {
                                                    var url = window.location.href;
                                                    window.location.href = url.substr(0,url.length-1)+"?tab=2";
                                                } else {
                                                    sweetalert(data.message);
                                                }
                                            });
                                    } else {
                                        return false;
                                    }
                                } else {
                                    swal({
                                            title: "是否要添加该用户为您的代表？",
                                            text: nominated_inviter.name + "   " + nominated_inviter.phone,
                                            //type: "warning",
                                            showCancelButton: true,
                                            confirmButtonColor: '#00913a',
                                            confirmButtonText: '确定',
                                            cancelButtonText: "取消",
                                            closeOnConfirm: false
                                        },
                                        function (isConfirm) {
                                            if (isConfirm) {
                                                remoteApiService.bindInviter(nominated_inviter.phone)
                                                    .then(function (data) {
                                                        if (data.code == 1000) {
                                                            var url = window.location.href;
                                                            window.location.href = url.substr(0,url.length-1)+"?tab=2";
                                                        } else {
                                                            sweetalert(data.message);
                                                        }
                                                    });
                                            }
                                        });
                                }
                            }
                        });

                }
            });
    });



    $scope.bindInviter = function(){
        $scope.$apply();
        if(!$scope.phoneNumberValidated){
            sweetalert('该手机号未注册，请确认后重新输入')
        }
        else if($scope.phone==$scope.inviterNum){
                    sweetalert('不能设置自己为邀请人')
        }else {
            if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i) == "8.") {
                var r = confirm("代表人添加后不可修改,确定设置该用户为您的代表吗?");
                if (r == true) {
                    remoteApiService.bindInviter($scope.inviterNum)
                        .then(function (data) {
                            if (data.code == 1000) {
                                var url = window.location.href;
                                window.location.href = url.substr(0,url.length-1)+"?tab=2";
                            } else {
                                sweetalert(data.message);
                            }
                        });
                } else {
                    return false;
                }
            } else {
                swal({
                        title: "新新农人",
                        text: "代表人添加后不可修改,确定设置该用户为您的代表吗?",
                        //type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: '#00913a',
                        confirmButtonText: '确定',
                        cancelButtonText: "取消",
                        closeOnConfirm: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            remoteApiService.bindInviter($scope.inviterNum)
                                .then(function (data) {
                                    if (data.code == 1000) {
                                        var url = window.location.href;
                                        window.location.href = url.substr(0,url.length-1)+"?tab=2";
                                    } else {
                                        sweetalert(data.message);
                                    }
                                });
                        }
                    });
            }
        }
    };

    remoteApiService.getBasicUserInfo()
        .then(function (data) {
            $scope.inviter = data.datas.inviter;
            $scope.inviterName = data.datas.inviterName;
            $scope.imgUrl = data.datas.inviterPhoto;
            if(!$scope.imgUrl){
                $scope.imgUrl = "images/default_avatar.png"
            }
            $scope.phone = data.datas.phone;
        });

    $scope.getInviteeOrders = function(inviteeUserId,page){
        $scope.showOrders = true;
        selectedInviteeId = inviteeUserId;
        remoteApiService.getInviteeOrders(inviteeUserId,page,ordersPerPage)
            .then(function (data) {
                $scope.pages_count = data.datas.pages;
                // $scope.pages_count = 30;
                generate_page();
                $scope.phone = data.datas.account;
                $scope.name = data.datas.name?data.datas.name:"该客户未设置姓名";
                $scope.ordersNum = data.datas.total;
                $scope.orderList = data.datas.rows;
                for(var order in $scope.orderList){
                    $scope.orderList[order].typeName = getOrderTypeName($scope.orderList[order].typeValue);
                    // var d = new Date(commonService.parseDate($scope.orderList[order].dateCreated));
                    // $scope.orderList[order].createTime_local = d.toLocaleString();
                    var d = Date.fromISO($scope.orderList[order].dateCreated);
                    $scope.orderList[order].createTime_local = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString()+' '+d.getHours().toString()+':'+timeStringExtendZero(d.getMinutes().toString())+':'+ timeStringExtendZero(d.getSeconds().toString());
                }
            });
    };

    $scope.show_page = function(pageId){
        if(pageId!='...'){
            $scope.current_page = pageId;
            for(var pageIndex in $scope.pages){
                if($scope.pages[pageIndex].id == pageId){
                    $scope.pages[pageIndex].isSelected = true;
                }else {
                    $scope.pages[pageIndex].isSelected = false;
                }
            }
            $scope.orderList = [];
            generate_page();
            $scope.getInviteeOrders(selectedInviteeId,pageId);
        }
    };

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
    var getOrderTypeName = function(typeNum) {
        switch (typeNum) {
            case 1:
                return '待付款';
                break;
            case 2:
                return '待发货';
                break;
            case 3:
                return '已发货';
                break;
            case 4:
                return '已完成';
                break;
            default:
                return '已关闭';
        }
    };
    var timeStringExtendZero = function(timeString){
        if(timeString.length < 2){
            return '0'+timeString;
        }else{
            return timeString;
        }
    };
});


app.filter('convertDateToLocal', function (commonService) {
    return function (date) {
        var d = new Date(commonService.parseDate(date));
        return d.toLocaleString();
    };
});
