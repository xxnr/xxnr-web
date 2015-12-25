var app = angular.module('xxnr_common');
app.directive('header', function(){
    return{
        templateUrl:'header.html',
        replace:true
    }
}).directive('footer', function(){
	return{
		templateUrl:'footer.html',
		replace:true
	}
});