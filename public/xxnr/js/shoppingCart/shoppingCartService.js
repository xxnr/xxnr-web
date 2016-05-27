/**
 * Created by zhouxin on 2016/01/18.
 */
var app = angular.module('xxnr_common');
app.service('shoppingCartService', function($cookieStore, BaseUrl, BaseDomainREG, hostnameService, $timeout) {
    var scartKey = "__scart";

    this.getSCart = function() {
        var scart = $cookieStore.get(scartKey);
        if (scart) {
            return scart;
        }
        return null;
    };

    this.setSCart = function(value) {
        var hostname = hostnameService.getHostname();
        if (BaseDomainREG.test(hostname)) {
            $cookieStore.put(scartKey, value, {
                path: "/",
                domain: ".xinxinnongren.com"
            });
        } else {
            $cookieStore.put(scartKey, value, {
                path: "/"
            });
        }
    };
});
