/**
 * Created by pepelu on 9/21/2015.
 */
var app=angular.module('xxnr_common');
app.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});