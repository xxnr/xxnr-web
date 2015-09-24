/**
 * Created by pepelu on 9/18/2015.
 */
var app = angular.module('xxnr');
app.controller('loginController', function($scope, $timeout, remoteApiService){
    $scope.showPop = false;
    $scope.blockSendCode = false;
    $scope.countDown = '发送验证码';
    $scope.login = function(){
        remoteApiService.login($scope.phoneNumber, $scope.password)
            .then(function (data) {
                if (data.code == 1000) {
                    sessionStorage.setItem('user', JSON.stringify(data.datas));
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                }
            })
    };
    $scope.forgetPassword = function(){
        $scope.showPop = true;
    };
    $scope.closePop = function(){
        $scope.showPop = false;
    };
    $scope.sendRegistCode = function(event){
        if($scope.blockSendCode){
            event.stopPropagation;
            return;
        }
        if(checkPhoneNumber()) {
            remoteApiService.sendCode($scope.phoneNumber, 'register')
                .then(function (data) {
                    if (data.code == '1000') {
                        alert('成功获取短信，请注意查收');
                        $scope.blockSendCode = true;
                        setTimeOut(5);
                    }
                })
        }
    };
    $scope.sendResetCode = function(event){
        if($scope.blockSendCode){
            event.stopPropagation;
            return;
        }
        if(checkPhoneNumber()) {
            remoteApiService.sendCode($scope.phoneNumber, 'resetpwd')
                .then(function (data) {
                    if (data.code == '1000') {
                        alert('成功获取短信，请注意查收');
                        $scope.blockSendCode = true;
                        setTimeOut(5);
                    }
                })
        }
    };
    var setTimeOut = function(timeOut){
        if(timeOut == 0){
            $scope.countDown = '发送验证码';
            $scope.blockSendCode = false;
        }
        else{
            $scope.countDown = '重新发送(' + timeOut + ')';
            $timeout(function(){
                setTimeOut(timeOut-1);
            }, 1000);
        }
    };
    var checkPhoneNumber = function(){
        if($scope.phoneNumber){
            if(!isNaN($scope.phoneNumber) && /^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/.test($scope.phoneNumber)){
                return true;
            }
            else{
                alert('手机号格式错误');
            }
        }else{
            alert('请输入手机号');
        }
        return false;
    };
    var checkCode = function(){
        if($scope.code){
            return true;
        }else{
            alert('请输入验证码');
        }
        return false;
    };
    var checkNewPassword = function(){
        if($scope.newPassword){
            if($scope.newPassword.length>=6){
                return true;
            }else{
                alert('密码长度需大于6位');
            }
        }else{
            alert('请输入密码');
        }
        return false;
    };
    var checkConfirmNewPassword = function(){
        if($scope.confirm_newPassword){
            if($scope.confirm_newPassword.length>=6){
                if($scope.newPassword == $scope.confirm_newPassword){
                    return true;
                }else{
                    alert('两次密码不一致');
                }
            }else{
                alert('密码长度需大于6位');
            }
        }else{
            alert('请再次输入密码');
        }
    };
    $scope.findPassword_submit = function(){
        if(checkPhoneNumber() && checkCode() && checkNewPassword() && checkConfirmNewPassword()){
            remoteApiService.resetPassword($scope.phoneNumber, $scope.newPassword, $scope.code)
                .then(function(data){
                    if(data.code == 1000){
                        alert('重置密码成功');
                        window.location.href='login.html';
                    }else{
                        alert(data.message);
                    }
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
        $scope.showPolicyPop = true;
    };
    $scope.hidePolicy = function(){
        $scope.showPolicyPop = false;
    };
    $scope.regist = function(){
        if(checkPhoneNumber() && checkCode() && checkNewPassword() && checkConfirmNewPassword()){
            remoteApiService.regist($scope.phoneNumber, $scope.newPassword, $scope.code, $scope.nickName)
                .then(function(data){
                    if(data.code == 1000){
                        sessionStorage.setItem('user', JSON.stringify(data.datas));
                        window.location.href='index.html';
                    }else{
                        alert(data.message);
                    }
                })
        }
    };
    $scope.regist_keydown = function(event){
        if(event.which == 13){
            $scope.regist();
        }
    };
    $scope.logout = function(){
        sessionStorage.removeItem('user');
        window.location.href="login.html";
    }
});