/**
 * Created by xxnr-cd on 15/12/14.
 */
app.service('sideService',function () {
    if ($(window).width() > 1600) {
        $('#back-to-top').css('right', '100px');
        $('#side_shoping_cart').css('right', '100px');
    } else {
        $('#back-to-top').css('right', '22px');
        $('#side_shoping_cart').css('right', '22px');
    }
    //if( $(document).height()-$('#side_shoping_cart').offset().top<500){
    //    $('#back-to-top').css('bottom', '430px');
    //    $('#side_shoping_cart').css('bottom', '375px');
    //}
    //if (window.location.href.indexOf("news_list") > -1) {
    //    $('#back-to-top').css('bottom', '425px');
    //    $('#side_shoping_cart').css('bottom', '370px');
    //}
    $('#side_shoping_cart').addClass('show');




    if ($('#back-to-top').length) {

        var scrollTrigger = 0, // px
            backToTop = function () {
                var scrollTop = $(window).scrollTop();
                if (scrollTop > scrollTrigger) {
                    //$('#back-to-top').css('bottom', '95px');
                    //$('#side_shoping_cart').css('bottom', '40px');
                    $('#back-to-top').addClass('show');
                    $('#side_shoping_cart').addClass('show');
                } else {
                    $('#back-to-top').removeClass('show');
                    //$('#side_shoping_cart').removeClass('show');
                }
            };
        backToTop();
        $(window).on('scroll', function () {
            //console.log($(document).height()-$('#side_shoping_cart').offset().top);
            //console.log($(document).height()-$('#back-to-top').offset().top);
            $('#back-to-top').css('bottom', '115px');
            $('#side_shoping_cart').css('bottom', '60px');
            if($(document).height()-$('#back-to-top').offset().top < 440){
                $('#back-to-top').css('bottom', '430px');
                $('#side_shoping_cart').css('bottom', '375px');
            }else{
                $('#back-to-top').css('bottom', '115px');
                $('#side_shoping_cart').css('bottom', '60px');
            }
            backToTop();
        });


        $(window).resize(function() {
            if ($(window).width() > 1600) {
                $('#back-to-top').css('right', '100px');
                $('#side_shoping_cart').css('right', '100px');
            } else {
                $('#back-to-top').css('right', '22px');
                $('#side_shoping_cart').css('right', '22px');
            }
        });

        $('#back-to-top').on('click', function (e) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 300);
        });


    }
});