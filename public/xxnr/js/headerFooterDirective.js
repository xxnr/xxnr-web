var app = angular.module('xxnr_common');
app.directive('header', function(){
    return{
        replace:true,
        restrict: 'AE',
        templateUrl: function(element, attrs) {
           return attrs.templateUrl || 'header';
        },
        controller: function ($scope) {
            $(function () {
                if (window.location.href.indexOf("resources") != -1) {
                    var login = document.getElementById('header_login');
                    login.href = "../../logon.html";
                    var register = document.getElementById('header_register');
                    register.href = "../../logon.html?tab=2";
                    var myNewFarmer = document.getElementById('myNewFarmer');
                    myNewFarmer.href = "../../my_xxnr.html";
                    var androidLink = document.getElementById('androidLink');
                    androidLink.href = "../../newFarmer.apk";
                }
            });
        },
        replace:true
    }
}).directive('footer', function(){
  return{
      replace:true,
        restrict: 'AE',
    templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'footer';
    },
      replace:true
  }
});