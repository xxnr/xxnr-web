/**
 * Created by pepelu on 9/20/2015.
 */
var app = angular.module('product_category');
app.directive('category', function(){
    return{
        restrict: 'AE',
        templateUrl:'list_template.html',
        replace:true
    }
});