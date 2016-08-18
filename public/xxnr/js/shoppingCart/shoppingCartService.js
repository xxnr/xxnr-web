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

        setTimeout(function(){
            // reset options-box position
            var dh = dh || $(document).height();
            var bh = $(window).height();
            var st = st || $(window).scrollTop();
            var el = $('.options-box');
            var eh = el.height();
            if (dh - st >= bh + 350 ) {
                el.css({
                    position: 'fixed',
                    left: el.offset().left,
                    border: '1px solid #e0e0e0',
                    bottom: 0
                });
                $(".cart_box").css({
                    'padding-bottom': 90
                });
            } else {
                el.removeAttr("style");
                $(".cart_box").removeAttr("style");
            }
            // end reset position
        });

    };
});
