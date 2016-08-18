/**
 * Created by pepelu on 9/18/2015.
 */
var app = angular.module('login', ['xxnr_common',"ngFlash"]);
app.controller('loginController', function($scope, $timeout, remoteApiService, commonService,$window,Flash){
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
    $scope.resetPasswordSucceedMsg = '';
    $scope.focusInputGroupNum = 0;
    $scope.errorInputGroupNum = 0;
    $scope.captcha = '';

    $scope.focusShowValidate = function(formInputGroupNum) {
        $scope.focusInputGroupNum = formInputGroupNum? formInputGroupNum : 0;
        $scope.errorInputGroupNum = 0;
        $scope.registerResMsg = '';
        $scope.loginResMsg = '';
        $scope.registerSucceedResMsg = '';
        $scope.resetPasswordMsg = '';
        $scope.resetPasswordSucceedMsg = '';
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
        registerConfirmPasswordsMismatch:7,
        resetPasswordPhone:8,
        resetPasswordCode:9,
        resetPassword:10,
        resetPasswordConfirm:11,
        resetConfirmPasswordsMismatch:12,
        registerCaptcha:13,
        resetCaptcha:14
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
                                            $scope.loginResMsg = data.message;
                                        }
                                    });
                            } else {
                                //sweetalert(data.message);
                                $scope.loginResMsg = data.message;
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
        $scope.code = undefined;
        $scope.newPassword = undefined;
        $scope.confirm_newPassword = undefined;
        $scope.resetPasswordMsg = '';
        $scope.reset_captcha = undefined;
        $timeout.cancel($scope.timeout);
        $scope.resetCountDown = '发送验证码';
    };
    $scope.sendRegistCode = function(event){
        if($scope.regBlockSendCode){
            event.stopPropagation;
            return;
        }
        if(checkPhoneNumber()) {
            $scope.captcha_loading = true;
            remoteApiService.sendCode($scope.phoneNumber, 'register', $scope.graph_code?$scope.graph_code:'')
                .then(function (data) {
                    if(data.code == 1000){
                        //sweetalert('成功获取短信，请注意查收');
                        if(data.captcha){
                            if(!$scope.graph_code && $scope.captcha){
                                $scope.registerResMsg = '请输入图形验证码';
                                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCaptcha;
                            }else if($scope.graph_code && $scope.captcha){
                                $scope.registerResMsg = data.message;
                                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCaptcha;
                            }
                            $scope.captcha = data.captcha?data.captcha:'';
                        }else{
                            $scope.captcha = '';
                            $scope.registerSucceedResMsg = '成功获取短信，请注意查收';
                            $scope.graph_code = undefined;
                            $scope.regBlockSendCode = true;
                            regSetTimeOut(60);
                        }
                        $scope.captcha_loading = false;
                    }else if(data.message=='请求参数错误，无效的tel参数'){
                        $scope.registerResMsg = '请输入正确的手机号';
                        $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
                        $scope.captcha_loading = false;
                    }else{
                        $scope.registerResMsg = data.message;
                        $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
                        $scope.captcha_loading = false;
                    }
                })
        }
    };
    $scope.getCaptcha = function(bizcode,isReset){
        if(checkPhoneNumber(isReset)) {
            if(bizcode == 'register'){
                remoteApiService.findAccount($scope.phoneNumber)
                    .then(function (data) {
                        if(data.code == 1000){
                            $scope.registerResMsg = data.message;
                            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
                        }else if(data.code == 1001){
                            var captchaUrl = commonService.baseUrl + 'api/v2.3/captcha?' + 'bizcode=' + bizcode + '&tel=' + $scope.phoneNumber + '&time=' + new Date().getTime();
                            $scope.captcha = captchaUrl;
                        }
                    })

            }else if(bizcode == 'resetpwd'){
                remoteApiService.findAccount($scope.phoneNumber)
                    .then(function (data) {
                        if(data.code == 1000){
                            var captchaUrl = commonService.baseUrl + 'api/v2.3/captcha?' + 'bizcode=' + bizcode + '&tel=' + $scope.phoneNumber + '&time=' + new Date().getTime();
                            $scope.reset_captcha = captchaUrl;
                        }else{
                            $scope.resetPasswordMsg = data.message;
                            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordPhone
                        }
                    })
            }
        }
    };
    $scope.sendResetCode = function(event){
        if($scope.resetBlockSendCode){
            event.stopPropagation;
            return;
        }
        $scope.focusShowValidate();
        if(checkPhoneNumber(true)) {
            $scope.captcha_loading = true;
            remoteApiService.sendCode($scope.phoneNumber, 'resetpwd', $scope.reset_graph_code?$scope.reset_graph_code:'')
                .then(function (data) {
                    if(data.code == 1000){
                        //sweetalert('成功获取短信，请注意查收');
                        if(data.captcha){
                            if(!$scope.reset_graph_code && $scope.reset_captcha){
                                $scope.resetPasswordMsg = '请输入图形验证码';
                                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetCaptcha;
                            }else if($scope.reset_graph_code && $scope.reset_captcha){
                                $scope.resetPasswordMsg = data.message;
                                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetCaptcha;
                            }
                            $scope.reset_captcha = data.captcha?data.captcha:'';
                        }else{
                            $scope.reset_captcha = '';
                            $scope.resetPasswordSucceedMsg = '成功获取短信，请注意查收';
                            $scope.reset_graph_code = undefined;
                            $scope.resetBlockSendCode = true;
                            resetSetTimeOut(60);
                        }
                        $scope.captcha_loading = false;
                    }else if(data.message=='请求参数错误，无效的tel参数'){
                        $scope.resetPasswordMsg = '手机号格式错误';
                        $scope.captcha_loading = false;
                    }else{
                        $scope.resetPasswordMsg = data.message;
                        $scope.captcha_loading = false;
                    }
                })

            //remoteApiService.sendCode($scope.phoneNumber, 'resetpwd')
            //    .then(function (data) {
            //        if(data.code == 1000){
            //            //sweetalert('成功获取短信，请注意查收');
            //            $scope.resetPasswordSucceedMsg = '成功获取短信，请注意查收';
            //            $scope.resetBlockSendCode = true;
            //            resetSetTimeOut(60);
            //        }else{
            //            //sweetalert(data.message);
            //            if(data.message == '请求参数错误，无效的tel参数'){
            //                $scope.resetPasswordMsg = '手机号格式错误';
            //            }else{
            //                $scope.resetPasswordMsg = data.message;
            //
            //            }
            //        }
            //    })
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
            $scope.timeout = $timeout(function(){
                resetSetTimeOut(timeOut-1);
            }, 1000);
        }
    };

    var checkLoginPhoneNumber = function(){
        if(!$scope.phoneNumber){
            //sweetalert('请输入手机号');
            $scope.loginResMsg = '请输入手机号';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPhone;
        }else{
            return true;
        }
        return false;
    };

    var checkLoginPassword = function(){
        if($scope.password){
            //if($scope.password.length>=6){
            //    return true;
            //}else{
            //    //sweetalert('密码长度需大于6位');
            //    $scope.loginResMsg = '密码需不小于6位';
            //    $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPassword;
            //}
            return true;
        }else{
            //sweetalert('请输入密码');
            $scope.loginResMsg = '请输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.loginPassword;
        }
        return false;
    };

    var checkPhoneNumber = function(isResetPassword){   //isResetPassword 是否正在进行找回密码的验证
        if($scope.phoneNumber){
            if(!isNaN($scope.phoneNumber) && /^1\d{10}$/.test($scope.phoneNumber)){
                return true;
            }
            else if(!isResetPassword){
                //sweetalert('手机号格式错误');
                $scope.registerResMsg = '请输入正确的手机号';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
            }else if(isResetPassword){
                $scope.resetPasswordMsg = '请输入正确的手机号';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordPhone
            }
        }else if(!isResetPassword){
            //sweetalert('请输入手机号');
            $scope.registerResMsg = '请输入手机号';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
        }else if(isResetPassword){
            $scope.resetPasswordMsg = '请输入手机号';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordPhone;
        }
        return false;
    };
    var checkCaptcha = function(){
        if($scope.captcha){
            $scope.registerResMsg = '请先发送验证码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCode;
        }else{
            return true;
        }
        return false;
    };
    var checkResetCaptcha = function(){
        if($scope.reset_captcha){
            $scope.resetPasswordMsg = '请先发送验证码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetCaptcha;
        }else{
            return true;
        }
        return false;
    };
    var checkCode = function(isResetPassword){ //isResetPassword 是否正在进行找回密码的验证
        if($scope.code){
            return true;
        }else if(!isResetPassword){
            //sweetalert('请输入验证码');
            $scope.registerResMsg = '请输入验证码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCode;
        }else if(isResetPassword){
            $scope.resetPasswordMsg = '请输入验证码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordCode;
        }
        return false;
    };
    var checkNewPassword = function(isResetPassword){ //isResetPassword 是否正在进行找回密码的验证
        if($scope.newPassword){
            if($scope.newPassword.length>=6){
                return true;
            }else if(!isResetPassword){
                //sweetalert('密码长度需大于6位');
                $scope.registerResMsg = '密码需不小于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPassword;
            }else if(isResetPassword){
                $scope.resetPasswordMsg = '密码需不小于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPassword;
            }
        }else if(!isResetPassword){
            //sweetalert('请输入密码');
            $scope.registerResMsg = '请输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPassword;
        }else if(isResetPassword){
            $scope.resetPasswordMsg = '请输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPassword;
        }
        return false;
    };

    var checkConfirmNewPassword = function(isResetPassword){
        if($scope.confirm_newPassword){
            if($scope.confirm_newPassword.length>=6){
                if($scope.newPassword == $scope.confirm_newPassword){
                    return true;
                }else if(!isResetPassword){
                    //sweetalert('两次密码不一致');
                    $scope.registerResMsg = '两次密码输入不一致，请重新输入';
                    $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerConfirmPasswordsMismatch;
                }else if(isResetPassword){
                    $scope.resetPasswordMsg = '两次密码输入不一致，请重新输入';
                    $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetConfirmPasswordsMismatch;
                }
            }else if(!isResetPassword){
                //sweetalert('密码长度需大于6位');
                $scope.registerResMsg = '密码需不小于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPasswordConfirm;
            }else if(isResetPassword){
                $scope.resetPasswordMsg = '密码需不小于6位';
                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordConfirm;
            }
        }else if(!isResetPassword){
            //sweetalert('请再次输入密码');
            $scope.registerResMsg = '请再次输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPasswordConfirm;
        }else if(isResetPassword){
            $scope.resetPasswordMsg = '请再次输入密码';
            $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordConfirm;
        }
    };
    $scope.policyChecked = true;
    var checkPolicybox = function(){
        if($scope.policyChecked){
            return true;
        }else{
            //sweetalert('请接受使用协议');
            $scope.registerResMsg = '请同意网站使用协议';
        }
        return false;
    };
    $scope.findPassword_submit = function(){
        $scope.registerResMsg = "";
        $scope.resetPasswordMsg = "";
        $scope.resetPasswordSucceedMsg = "";
        if(checkPhoneNumber(true) && checkCode(true) && checkNewPassword(true) && checkConfirmNewPassword(true)){
            remoteApiService.getPublicKey()
                .then(function(data) {
                    var public_key = data.public_key;
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(public_key);
                    var encrypted = encrypt.encrypt($scope.newPassword);
                    remoteApiService.resetPassword($scope.phoneNumber, encodeURI(encrypted), $scope.code)
                        .then(function (data) {
                            if (data.code == 1000) {
                                //sweetalert('重置密码成功',"logon.html");
                                //$scope.resetPasswordSucceedMsg = '重置密码成功';
                                //window.location.href = 'logon.html';
                                var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">重置密码成功';
                                var id = Flash.create('success', message, 3000, {"class": 'xxnr-success-flash', "id": 'xxnr-success-flash'}, false);
                                //$timeout(function(){
                                //    window.location.href = "/logon.html";
                                //    return false
                                //},3000);
                                $scope.closePop();
                            } else {
                                //sweetalert(data.message);
                                $scope.resetPasswordMsg = data.message;
                                $scope.errorInputGroupNum = $scope.formInputsKeyValue.resetPasswordCode;
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
                    $scope.registerSucceedResMsg = '';  //当点击注册按钮的时候初始化提示信息
                    $scope.registerResMsg = '';   //当点击注册按钮的时候初始化提示信息
                    remoteApiService.regist($scope.phoneNumber, encodeURI(encrypted), $scope.code, $scope.nickName)
                        .then(function (data) {
                            if (data.code == 1000) {
                                sessionStorage.setItem('user', JSON.stringify(data.datas));
                                window.location.href = '/fillProfile.html';
                            } else {
                                //sweetalert(data.message);
                                $scope.registerResMsg = data.message;
                                if(data.message =='请输入正确的手机号'){
                                    $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerPhone;
                                }else if(data.message =='验证码输入错误'){
                                    $scope.errorInputGroupNum = $scope.formInputsKeyValue.registerCode;
                                }
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
