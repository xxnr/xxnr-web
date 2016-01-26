app.service('flyToCart',function (commonService) {

    this.fly = function(){
        var offset = $("#side_shoping_cart").offset();
        // $(".addcart").click(function(event){
        jQuery(function($) {
            var addcar = $(this);
            window.scrollTo(0, 0);
            var img = $('.product_img_slider img:first-child').attr('src');
            var flyer = $('<img class="u-flyer" src="'+img+'">');
            flyer.fly({
                start: {
                    left: event.pageX,
                    top: event.screenY -180
                },
                end: {
                    left: offset.left,
                    top: offset.top - $(window).scrollTop(),
                    width: 0,
                    height: 0
                },
                speed: 1.4,
                onEnd: function(){
//                        $("#msg").show().animate({width: '250px'}, 200).fadeOut(1000);
//                        addcar.css("cursor","default").removeClass('orange').unbind('click');
                    this.destory();
                }
            });
        });
    };
});
