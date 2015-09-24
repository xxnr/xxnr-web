/**
 * Created by pepelu on 9/15/2015.
 */
var app = angular.module('xxnr');
app.directive('common-header', function(){
    return{
        restrict: 'E',
        templateUrl: '../header.html',
        replace: true
    };
});