/**
 * Created by pepelu on 9/18/2015.
 */
var app = angular.module('login', ['xxnr_common']);
app.controller('loginController', function($scope, $timeout, remoteApiService, commonService){

    var sweetalert = commonService.sweetalert;
    $scope.tabNum = 1;
    if(Number(location.search[5])) {
        $scope.tabNum = Number(location.search[5]);
    }
    $scope.showPop = false;
    $scope.regBlockSendCode = false;
    $scope.resetBlockSendCode = false;
    $scope.regCountDown = '发送验证码';
    $scope.resetCountDown = '发送验证码';
    $scope.login = function(){
        remoteApiService.getPublicKey()
            .then(function(data) {
                var public_key = data.public_key;
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(public_key);
                var encrypted = encrypt.encrypt($scope.password);
                remoteApiService.login($scope.phoneNumber, encodeURI(encrypted), ($scope.keepLoginChecked ? true : false))
                    .then(function (data) {
                        //console.log(data.datas.isUserInfoFullFilled);
                        if (data.code == 1000) {
                            if(data.datas.isUserInfoFullFilled){
                                sessionStorage.setItem('user', JSON.stringify(data.datas));
                                window.location.href = '/';
                            }else{
                                sessionStorage.setItem('user', JSON.stringify(data.datas));
                                window.location.href = '/fillProfile.html';
                            }

                        } else if (data.code == 1001 && data.userVersion == 'v1.0') {
                            //re-request with md5
                            remoteApiService.login($scope.phoneNumber, hex_md5($scope.password))
                                .then(function (data) {
                                    if (data.code == 1000) {
                                        if(data.datas.isUserInfoFullFilled){
                                            sessionStorage.setItem('user', JSON.stringify(data.datas));
                                            window.location.href = '/';
                                        }else{
                                            sessionStorage.setItem('user', JSON.stringify(data.datas));
                                            window.location.href = '/fillProfile.html';
                                        }
                                    } else {
                                        sweetalert(data.message);
                                    }
                                });
                        } else {
                            sweetalert(data.message);
                        }
                    })
            })
    };
    $scope.phoneNumberValidated = false;
    $scope.$watch('phoneNumber',function(){
        if(!isNaN($scope.phoneNumber) && /*/^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/*/ /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test($scope.phoneNumber)){
            remoteApiService.findAccount($scope.phoneNumber)
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

    $scope.forgetPassword = function(){
        $scope.isOverflow = true;
        $scope.showPop = true;
    };
    $scope.closePop = function(){
        $scope.isOverflow = false;
        $scope.showPop = false;
        $scope.phoneNumber = "";
    };
    $scope.sendRegistCode = function(event){
        if($scope.regBlockSendCode){
            event.stopPropagation;
            return;
        }
        if(checkPhoneNumber()) {
            remoteApiService.sendCode($scope.phoneNumber, 'register')
                .then(function (data) {
                    if(data.code == 1000){
                        sweetalert('成功获取短信，请注意查收');
                        $scope.regBlockSendCode = true;
                        regSetTimeOut(60);
                    }else{
                        sweetalert(data.message);
                    }
                })
        }
    };
    $scope.sendResetCode = function(event){
        if($scope.resetBlockSendCode){
            event.stopPropagation;
            return;
        }
        if(checkPhoneNumber()) {
            remoteApiService.sendCode($scope.phoneNumber, 'resetpwd')
                .then(function (data) {
                    if(data.code == 1000){
                        sweetalert('成功获取短信，请注意查收');
                        $scope.resetBlockSendCode = true;
                        resetSetTimeOut(60);
                    }else{
                        sweetalert(data.message);
                    }
                })
        }
    };
    var regSetTimeOut = function(timeOut){
        if(timeOut == 0){
            $scope.regCountDown = '发送验证码';
            $scope.regBlockSendCode = false;
        }
        else{
            $scope.regCountDown = '重新发送(' + timeOut + ')';
            $timeout(function(){
                regSetTimeOut(timeOut-1);
            }, 1000);
        }
    };
    var resetSetTimeOut = function(timeOut){
        if(timeOut == 0){
            $scope.resetCountDown = '发送验证码';
            $scope.resetBlockSendCode = false;
        }
        else{
            $scope.resetCountDown = '重新发送(' + timeOut + ')';
            $timeout(function(){
                resetSetTimeOut(timeOut-1);
            }, 1000);
        }
    };


    var checkPhoneNumber = function(){
        if($scope.phoneNumber){
            if(!isNaN($scope.phoneNumber) && /*/^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/*/ /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test($scope.phoneNumber)){
                return true;
            }
            else{
                sweetalert('手机号格式错误');
            }
        }else{
            sweetalert('请输入手机号');
        }
        return false;
    };
    var checkCode = function(){
        if($scope.code){
            return true;
        }else{
            sweetalert('请输入验证码');
        }
        return false;
    };
    var checkNewPassword = function(){
        if($scope.newPassword){
            if($scope.newPassword.length>=6){
                return true;
            }else{
                sweetalert('密码长度需大于6位');
            }
        }else{
            sweetalert('请输入密码');
        }
        return false;
    };

    var checkConfirmNewPassword = function(){
        if($scope.confirm_newPassword){
            if($scope.confirm_newPassword.length>=6){
                if($scope.newPassword == $scope.confirm_newPassword){
                    return true;
                }else{
                    sweetalert('两次密码不一致');
                }
            }else{
                sweetalert('密码长度需大于6位');
            }
        }else{
            sweetalert('请再次输入密码');
        }
    };
    $scope.policyChecked = true;
    var checkPolicybox = function(){
        if($scope.policyChecked){
            return true;
        }else{
            sweetalert('请接受使用协议');
        }
        return false;
    };
    $scope.findPassword_submit = function(){
        if(checkPhoneNumber() && checkCode() && checkNewPassword() && checkConfirmNewPassword()){
            remoteApiService.getPublicKey()
                .then(function(data) {
                    var public_key = data.public_key;
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(public_key);
                    var encrypted = encrypt.encrypt($scope.newPassword);
                    remoteApiService.resetPassword($scope.phoneNumber, encodeURI(encrypted), $scope.code)
                        .then(function (data) {
                            if (data.code == 1000) {
                                sweetalert('重置密码成功',"logon.html");
                                //window.location.href = 'logon.html';
                            } else {
                                sweetalert(data.message);
                            }
                        })
                })
        }
    };
    $scope.password_keydown = function(event){
        if(event.which == 13){
            $scope.login();
        }
    };
    $scope.confirm_newPassword_keydown = function(event){
        if(event.which == 13){
            $scope.findPassword_submit();
        }
    };

    // regist part
    $scope.showPolicyPop = false;
    $scope.showPolicy = function(){
        $scope.isOverflow = true;
        $scope.showPolicyPop = true;
    };
    $scope.hidePolicy = function(){
        $scope.showPolicyPop = false;
        $scope.isOverflow = false;
    };
    $scope.regist = function(){
        if(checkPolicybox() && checkPhoneNumber() && checkCode() && checkNewPassword() && checkConfirmNewPassword()){
            remoteApiService.getPublicKey()
                .then(function(data) {
                    var public_key = data.public_key;
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(public_key);
                    var encrypted = encrypt.encrypt($scope.newPassword);
                    remoteApiService.regist($scope.phoneNumber, encodeURI(encrypted), $scope.code, $scope.nickName)
                        .then(function (data) {
                            if (data.code == 1000) {
                                sessionStorage.setItem('user', JSON.stringify(data.datas));
                                window.location.href = '/fillProfile.html';
                            } else {
                                sweetalert(data.message);
                            }
                        })
                })
        }
    };
    $scope.regist_keydown = function(event){
        if(event.which == 13){
            $scope.regist();
        }
    };
});
