/**
 * Created by pepelu on 9/18/2015.
 */
var app = angular.module('login', ['xxnr_common']);
app.controller('loginController', function($scope, $timeout, remoteApiService, commonService,$window){
    function getQueryStringByName(name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    }
    var sweetalert = commonService.sweetalert;
    if(getQueryStringByName('type')=='register') {
        $scope.tab = 2;
        $window.document.title = "注册";
    }else{
        $scope.tab = 1;
        $window.document.title = "登录";
    }
    $scope.showPop = false;
    $scope.regBlockSendCode = false;
    $scope.resetBlockSendCode = false;
    $scope.regCountDown = '发送验证码';
    $scope.resetCountDown = '发送验证码';
    $scope.loginResMsg = '';
    $scope.registerResMsg = '';
    $scope.registerSucceedResMsg = '';
    $scope.resetPasswordMsg = '';
    $scope.focusInputGroupNum = 0;
    $scope.errorInputGroupNum = 0;

    $scope.focusShowValidate = function(formInputGroupNum) {
        $scope.focusInputGroupNum = formInputGroupNum;
        $scope.registerResMsg = '';
        $scope.loginResMsg = '';
        $scope.registerSucceedResMsg = '';
        $scope.resetPasswordMsg = '';
    };
    $scope.blurShowValidate = function() {
        $scope.focusInputGroupNum = 0;
    };

    $scope.formInputsKeyValue = {
        loginPhone:1,
        loginPassword:2,
        registerPhone:3,
        registerCode:4,
        registerPassword:5,
        registerPasswordConfirm:6,
        registerConfirmPasswordsMismatch:7
    }
    $scope.login = function(){
        $scope.loginResMsg = "";
        $scope.errorInputGroupNum = 0;
        if( !checkLoginPhoneNumber() || !checkLoginPassword() ){
            return false;
        }else{
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
                                            //sweetalert(data.message);
                                            $scope.loginResMsg = '用户名或密码不匹配，请重新输入';
                                        }
                                    });
                            } else {
                                //sweetalert(data.message);
                                $scope.loginResMsg = '用户名或密码不匹配，请重新输入';
                            }
                        })
                })
        }

    };
    $scope.phoneNumberValidated = false;
    $scope.$watch('phoneNumber',function(){
        if(!isNaN($scope.phoneNumber) && /^1\d{10}$/.test($scope.phoneNumber)){
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
                        //sweetalert('成功获取短信，请注意查收');
                        $scope.registerSucceedResMsg = '成功获取短信，请注意查收';
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
        }else{
            $scope.resetPasswordMsg = '请输入正确用户名';
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

    var checkLoginPhoneNumber = function(){
        if(!$scope.phoneNumber){
            //sweetalert('请输入手机号');
            $scope.loginResMsg = '请输入你的手机号';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPhone;
        }else{
            return true;
        }
        return false;
    };

    var checkLoginPassword = function(){
        if($scope.password){
            if($scope.password.length>=6){
                return true;
            }else{
                //sweetalert('密码长度需大于6位');
                $scope.loginResMsg = '密码长度需大于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPassword;
            }
        }else{
            //sweetalert('请输入密码');
            $scope.loginResMsg = '请输入你的密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPassword;
        }
        return false;
    };

    var checkPhoneNumber = function(){
        if($scope.phoneNumber){
            if(!isNaN($scope.phoneNumber) && /^1\d{10}$/.test($scope.phoneNumber)){
                return true;
            }
            else{
                //sweetalert('手机号格式错误');
                $scope.registerResMsg = '手机号格式错误';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
            }
        }else{
            //sweetalert('请输入手机号');
            $scope.registerResMsg = '请输入手机号';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
        }
        return false;
    };
    var checkCode = function(){
        if($scope.code){
            return true;
        }else{
            //sweetalert('请输入验证码');
            $scope.registerResMsg = '请输入验证码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCode;
        }
        return false;
    };
    var checkNewPassword = function(){
        if($scope.newPassword){
            if($scope.newPassword.length>=6){
                return true;
            }else{
                //sweetalert('密码长度需大于6位');
                $scope.registerResMsg = '密码长度需大于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPassword;
            }
        }else{
            //sweetalert('请输入密码');
            $scope.registerResMsg = '请输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPassword;
        }
        return false;
    };

    var checkConfirmNewPassword = function(){
        if($scope.confirm_newPassword){
            if($scope.confirm_newPassword.length>=6){
                if($scope.newPassword == $scope.confirm_newPassword){
                    return true;
                }else{
                    //sweetalert('两次密码不一致');
                    $scope.registerResMsg = '两次密码不一致';
                    $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerConfirmPasswordsMismatch;
                }
            }else{
                //sweetalert('密码长度需大于6位');
                $scope.registerResMsg = '密码长度需大于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPasswordConfirm;
            }
        }else{
            //sweetalert('请再次输入密码');
            $scope.registerResMsg = '请再次输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPasswordConfirm;
        }
    };
    $scope.policyChecked = true;
    var checkPolicybox = function(){
        if($scope.policyChecked){
            return true;
        }else{
            //sweetalert('请接受使用协议');
            $scope.registerResMsg = '请接受使用协议';
        }
        return false;
    };
    $scope.findPassword_submit = function(){
        $scope.registerResMsg = "";
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

    $scope.showRegisterError = function(){
        return $scope.registerForm.phoneNumber.$dirty && $scope.registerForm.phoneNumber.$error.required ||
            $scope.registerForm.newPassword.$dirty && $scope.registerForm.newPassword.$error.required ||
            $scope.registerForm.confirm_newPassword.$dirty && $scope.registerForm.confirm_newPassword.$error.required ||
            $scope.registerResMsg;
    }
});

var PHONE_REGEXP = /^1\d{10}$/;
app.directive('phoneverfied', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (PHONE_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('phoneverfied', true);
                    scope.registerResMsg = '';
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('phoneverfied', false);
                    //if(!viewValue){
                    //    scope.registerResMsg = '请输入手机号';
                    //}else{
                    //    scope.registerResMsg = '手机号格式错误';
                    //}
                    return viewValue;
                }
            });
        }
    };
});
