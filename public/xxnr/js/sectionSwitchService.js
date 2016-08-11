/**
 * Created by xxnr-cd on 16/8/9.
 */
app.service('sectionSwitchService',function () {

    if ($('.switch_section').length) {
        $(window).on('scroll', function () {
            if(window.scrollY > 200){
                $('.switch_section').css('top', '10px');
                $('.switch_section').css('position', 'fixed');
            }else{
                $('.switch_section').css('top', '60px');
                $('.switch_section').css('position', 'absolute');

            }
        });

    }
});