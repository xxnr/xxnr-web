/**
 * Created by cuidi on 15/11/6.
 */
var app = angular.module('invitation', ['xxnr_common','shop_cart',"ngFlash"]);
app.controller('invitationController', function($scope, remoteApiService, commonService, loginService, sideService, Flash){
    var _user = commonService.user;
    var sweetalert = commonService.sweetalert;
    var sweetConfirm = commonService.sweetConfirm;
    var firstLoadPage = true;
    $scope.InviteeOrders = [];
    $scope.confirm = false;
    $scope.tabNum = 1;
    $scope.showOrders = false;
    $scope.hasInvitees = false;
    var ordersPerPage = 20;
    var selectedInviteeId = '';
    if(Number(location.search[5]) | Number(location.search[5])===0) {
        $scope.tabNum = Number(location.search[5]);
    }

    $scope.inviteeOrdersPager = {pager_num:1,current_page:1};
    $scope.inviteesPager = {pager_num:2,current_page:1};
    var pages_generator = function(pager){
        resetPager(pager);
        formatingPager(pager);
    };

    function resetPager(pager){
        pager.pages = [];
        for(var id=1; id<=pager.pages_count; id++){
            pager.pages.push({id:id, isSelected:false});
        }
        if(pager.pages.length >0) {
            pager.pages[0].isSelected = true;
        }
        for(var pageIndex in pager.pages){
            if(pager.pages[pageIndex].id == pager.current_page){
                pager.pages[pageIndex].isSelected = true;
            }else {
                pager.pages[pageIndex].isSelected = false;
            }
        }
    }
    var formatingPager = function(pager){
        if(pager.pages.length<=7){                                                     // e.g.: 1 2 3 4 5 6 7
            pager.pages = pager.pages;
        }else if(pager.pages.length>7 && pager.current_page<5){                              // e.g.: 1 2 3 4 5 ... 20
            pager.pages = pager.pages.slice(0,6).concat(pager.pages[pager.pages.length-1]);
            pager.pages[5].id = '...';
        }else if(pager.pages.length>7 && pager.current_page <= pager.pages_count && pager.current_page> pager.pages_count - 4 ) {    // e.g.: 1 ... 16 17 18 19 20
            pager.pages = pager.pages.slice(0,1).concat(pager.pages.slice(pager.pages.length-6,pager.pages.length));
            pager.pages[1].id = '...';
        }else{                                                                          // e.g.: 1 .. 8 9 10 ... 20
            var tempFirst = pager.pages[0];
            var tempLast = pager.pages[pager.pages.length-1];
            pager.pages = pager.pages.slice(pager.current_page-3,pager.current_page+2);
            pager.pages[0].id = '...';
            pager.pages[pager.pages.length-1].id = '...';
            pager.pages.push(tempLast);
            pager.pages.unshift(tempFirst);
        }
    };


    function getInvitees(page){
        var _page = page ? page : 1;
        remoteApiService.getInvitee(_page)
            .then(function (data) {
                $scope.invitees = data.invitee;
                $scope.inviteesCount = data.total;
                $scope.hasInvitees = data.total > 0 ? true : false;
                $scope.inviteesPager.pages_count = data.pages;
                pages_generator($scope.inviteesPager);
                for(var index in $scope.invitees){
                    if($scope.invitees.hasOwnProperty(index)){
                        var d = Date.fromISO($scope.invitees[index].dateinvited);
                        $scope.invitees[index].dateinvited = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString();
                    }
                }
            });
    }
    getInvitees();
    $scope.search_invitees = function(page){
        var _page = page ? page : 1;
        remoteApiService.getInvitee(_page,$scope.inviteeSearch)
            .then(function (data) {
                $scope.invitees = data.invitee;
                $scope.inviteesCount = data.total;
                $scope.inviteesPager.pages_count = data.pages;
                pages_generator($scope.inviteesPager);
                for(var index in $scope.invitees){
                    if($scope.invitees.hasOwnProperty(index)){
                        var d = Date.fromISO($scope.invitees[index].dateinvited);
                        $scope.invitees[index].dateinvited = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString();
                    }
                }
            });
    };

    $scope.inviterPhoneNumberValidated = false;
    $scope.$watch('inviterNum',function(){
        if(!isNaN($scope.inviterNum) && /^1\d{10}$/.test($scope.inviterNum)){
            //remoteApiService.findAccount($scope.inviterNum)
            //    .then(function (data) {
            //        if(data.code == 1000){
            //            $scope.phoneNumberValidated = true;
            //        }else{
            //            $scope.phoneNumberValidated = false;
            //        }
            //    })
            $scope.phoneNumberValidated = true;
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
                                    var r = confirm("是否要添加该用户为您的代表？\n" + nominated_inviter.name + '   ' + nominated_inviter.phone);
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
                                            text: nominated_inviter.name + ' &nbsp;&nbsp;<img src="images/phone-icon.png" alt="">' + nominated_inviter.phone,
                                            //type: "warning",
                                            showCancelButton: true,
                                            confirmButtonColor: '#00913a',
                                            confirmButtonText: '确定',
                                            cancelButtonText: "取消",
                                            closeOnConfirm: false,
                                            html: true
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
        if(!$scope.inviterNum){
            //sweetalert('该手机号未注册，请确认后重新输入');
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请输入手机号';
            var id = Flash.create('success', message, 3000, {"class": 'xxnr-warning-flash', "id": 'xxnr-warning-flash'}, false);
        } else if(!$scope.phoneNumberValidated){
            //sweetalert('该手机号未注册，请确认后重新输入');
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">请输入正确的手机号';
            var id = Flash.create('success', message, 3000, {"class": 'xxnr-warning-flash', "id": 'xxnr-warning-flash'}, false);
        } else if($scope.userPhone==$scope.inviterNum){
            //sweetalert('不能设置自己为邀请人');
            var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">不能设置自己为邀请人';
            var id = Flash.create('success', message, 3000, {"class": 'xxnr-warning-flash', "id": 'xxnr-warning-flash'}, false);
        }else {
            remoteApiService.findAccount($scope.inviterNum)
                .then(function (data) {
                    if(data.code == 1000){
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
                    }else{
                        var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">'+data.message;
                        var id = Flash.create('success', message, 3000, {"class": 'xxnr-warning-flash', "id": 'xxnr-warning-flash'}, false);
                    }
                })

        }
    };
    remoteApiService.getInviter()
        .then(function (data) {
            $scope.inviterTypeNum = data.datas.inviterUserType;
            $scope.inviterAddresses = data.datas.inviterAddress;
            $scope.inviterAddressProvinceName = $scope.inviterAddresses.province?$scope.inviterAddresses.province.name:"";
            $scope.inviterAddressCityName = $scope.inviterAddresses.city?$scope.inviterAddresses.city.name:"";
            $scope.inviterAddressCountyName = $scope.inviterAddresses.county?$scope.inviterAddresses.county.name:"";
            $scope.inviterAddressTownName = $scope.inviterAddresses.town?$scope.inviterAddresses.town.name:"";
            $scope.inviterAddressesString = $scope.inviterAddressProvinceName + " " + $scope.inviterAddressCityName + " " + $scope.inviterAddressCountyName + " " + $scope.inviterAddressTownName;
            $scope.inviterIsVerified = data.datas.inviterIsVerified;
            $scope.inviterPhone = data.datas.inviterPhone;
            $scope.inviterName = data.datas.inviterName;
            $scope.inviterIsVerified = data.datas.inviterIsVerified;
            $scope.inviterSex = data.datas.inviterSex;
            remoteApiService.userTypeList()
                .then(function (data) {
                    $scope.inviterType = data.data[Number($scope.inviterTypeNum)]
                });
            $scope.imgUrl = data.datas.inviterPhoto;
            if(!$scope.imgUrl){
                $scope.imgUrl = "images/default_avatar.png"
            }
        });

    remoteApiService.getBasicUserInfo()
        .then(function (data) {
            $scope.userPhone = data.datas.phone;
        });

    $scope.getInviteeOrders = function(inviteeUserId,page){
        $scope.showOrders = true;
        selectedInviteeId = inviteeUserId;
        remoteApiService.getInviteeOrders(inviteeUserId,page,ordersPerPage)
            .then(function (data) {
                $scope.inviteeOrdersPager.pages_count = data.datas.pages;
                pages_generator($scope.inviteeOrdersPager);
                $scope.phone = data.datas.account;
                $scope.name = data.datas.name?data.datas.name:"该客户未设置姓名";
                $scope.ordersNum = data.datas.total;
                $scope.orderList = data.datas.rows;
                $scope.addresses = data.datas.address;
                for(var order in $scope.orderList){
                    $scope.orderList[order].typeName = getOrderTypeName($scope.orderList[order].typeValue);
                    // var d = new Date(commonService.parseDate($scope.orderList[order].dateCreated));
                    // $scope.orderList[order].createTime_local = d.toLocaleString();
                    var d = Date.fromISO($scope.orderList[order].dateCreated);
                    $scope.orderList[order].createTime_local = d.getFullYear().toString()+'-'+ (d.getMonth()+1).toString() +'-'+d.getDate().toString()+' '+d.getHours().toString()+':'+timeStringExtendZero(d.getMinutes().toString())+':'+ timeStringExtendZero(d.getSeconds().toString());
                }
            });
    };
    $scope.backToInviteesList = function(){
        $scope.tab = 1;
        $scope.showOrders = false;
        $scope.phone = undefined;
        $scope.name = undefined;
        $scope.ordersNum = 0;
        $scope.addresses = undefined;
    };

    $scope.show_page = function(pager,pageId){
        if(pageId!='...'){
            $('html,body').animate({
                scrollTop: 0
            }, 100);
            pager.current_page = pageId;
            for(var pageIndex in pager.pages){
                if(pager.pages[pageIndex].id == pageId){
                    pager.pages[pageIndex].isSelected = true;
                }else {
                    pager.pages[pageIndex].isSelected = false;
                }
            }
            $scope.orderList = [];
            pages_generator(pager);
            if(pager.pager_num==1){
                $scope.getInviteeOrders(selectedInviteeId,pageId);
            }else if(pager.pager_num==2){
                getInvitees(pageId);
            }
        }
    };

    $scope.pre_page = function(pager){
        if(pager.current_page>1){
            pager.current_page--;
            $scope.show_page(pager,pager.current_page);
        }
    };

    $scope.next_page = function(pager){
        if(pager.current_page<pager.pages_count){
            pager.current_page++;
            $scope.show_page(pager,pager.current_page);
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
