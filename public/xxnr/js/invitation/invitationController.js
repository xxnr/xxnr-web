/**
 * Created by cuidi on 15/11/6.
 */
var app = angular.module('invitation', ['xxnr_common','shop_cart']);
app.controller('invitationController', function($scope, remoteApiService, commonService, loginService, sideService){
    var _user = commonService.user;
    var sweetalert = commonService.sweetalert;
    var sweetConfirm = commonService.sweetConfirm;
    $scope.tabNum = 1;
    if(Number(location.search[5]) | Number(location.search[5])===0) {
        $scope.tabNum = Number(location.search[5]);
    }
    $scope.confirm = false;

    remoteApiService.getInvitee()
        .then(function (data) {
            $scope.invitees = data.invitee;
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
            $scope.inviterNickname = data.datas.inviterNickname;
            $scope.imgUrl = data.datas.inviterPhoto;
            if(!$scope.imgUrl){
                $scope.imgUrl = "images/default_avatar.png"
            }
            $scope.phone = data.datas.phone;
        });
});

app.filter('convertDateToLocal', function (commonService) {
    return function (date) {
        var d = new Date(commonService.parseDate(date));
        return d.toLocaleString();
    };
});