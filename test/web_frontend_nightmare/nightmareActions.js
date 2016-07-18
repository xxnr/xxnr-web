/**
 * Created by xxnr-cd on 16/7/12.
 */
var Nightmare = require('nightmare');
//define a new Nightmare method named "checkNgShow"
//note that it takes a selector as a parameter
Nightmare.action('checkNgShow', function(selector, done) {
    //`this` is the Nightmare instance
    this.evaluate_now((selector) => {
        //query the document for element that match `selector`
        var _dom =  document.querySelector(selector);
        return _dom.className.indexOf('ng-hide') == -1; //if className doesn't have 'ng-hide', it means ng-show
        //pass done as the first argument, other arguments following
    }, done, selector)
});

//define a new Nightmare method named "checkNgHide"
//note that it takes a selector as a parameter
Nightmare.action('checkNgHide', function(selector, done) {
    //`this` is the Nightmare instance
    this.evaluate_now((selector) => {
        //query the document for element that match `selector`
        var _dom =  document.querySelector(selector);
        return _dom.className.indexOf('ng-hide') != -1; //if className doesn't have 'ng-hide', it means ng-show
        //pass done as the first argument, other arguments following
    }, done, selector)
});