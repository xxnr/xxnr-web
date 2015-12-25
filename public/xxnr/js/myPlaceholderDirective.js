app.directive('myPlaceholder', ['$compile', function($compile){
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, ele, attr) {
            var input = document.createElement('input');
            var isSupportPlaceholder = 'placeholder' in input;
            if (!isSupportPlaceholder) {
                var fakePlaceholder = angular.element(
                    '<span class="placeholder">' + attr['placeholder'] + '</span>');
                fakePlaceholder.on('click', function(e){
                    e.stopPropagation();
                    ele.focus();
                });
                ele.before(fakePlaceholder);
                $compile(fakePlaceholder)(scope);
                ele.on('focus', function(){
                    fakePlaceholder.hide();
                }).on('blur', function(){
                    if (ele.val() === '') {
                        fakePlaceholder.show();
                    }
                });
            }
        }
    };
}]);