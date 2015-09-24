/**
 * Created by pepelu on 9/20/2015.
 */
var app = angular.module('xxnr');
app.directive('category', function(){
    return{
        templateUrl:'category_template.html',
        replace:true
    }
});