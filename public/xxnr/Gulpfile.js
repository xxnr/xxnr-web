/**
 * Created by xxnr-cd on 15/11/26.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');                            //- 多个文件合并为一个；
var minifyCss = require('gulp-minify-css');                     //- 压缩CSS为一行;
var RevAll = require('gulp-rev-all');
var uglify = require('gulp-uglify');
var del = require('del');
var ngmin = require('gulp-ngmin');
var revReplace = require('gulp-rev-replace');
var replace = require('gulp-replace');
var htmlreplace = require('gulp-html-replace');
//var runSequence = require('run-sequence');

gulp.task('css_minify', function() {                                //- 创建一个名为 concat 的 task
    var revAll = new RevAll();
    gulp.src(['./css/addAddress.css', './css/sweetalert.css','./css/uploadify.css','./css/style.css'])    //- 需要处理的css文件，放到一个字符串数组里
        .pipe(concat('styleAllInOne.css'))                            //- 合并后的文件名
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(gulp.dest('./dev/css'))
        .pipe(revAll.revision())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest('./production_css'))                               //- 输出文件本地
        .pipe(revAll.manifestFile())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev/css'));                              //- 将 rev-manifest.json 保存到 rev 目录内
});

gulp.task('framework_js_minify', function() {
    var revAll = new RevAll();
    gulp.src(['./js/jquery.min.js',
        './js/selectivizr-min.js',
        './js/angular.min.js',
        './js/angular-cookies.min.js',
        './js/common.js',
        './js/remoteApiService.js',
        './js/sideService.js'])
        .pipe(concat('framework_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/framework_js'));
});


gulp.task('index_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/responsiveslides.min.js',
        './js/payService.js',
        './js/news/newsController.js',
        './js/responsiveslides.min.js',
        './js/payService.js',
        './js/news/newsController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/index/indexController.js',
        './js/login/loginController.js',
        './js/login/loginService.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js',
        './js/jquery.fly.min.js',
        './js/jquery.SuperSlide.2.1.1.js'])
        .pipe(concat('index_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/index_js'));
});

gulp.task('car_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/category/categoryController.js',
        './js/category/carController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/category/categoryDirective.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('car_list_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/car_js'));
});


gulp.task('huafei_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/category/categoryController.js',
        './js/category/huafeiController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/category/categoryDirective.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('huafei_list_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/huafei_js'));
});


gulp.task('company_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/responsiveslides.min.js',
        './js/sweetalert.min.js',
        './js/jquery.SuperSlide.2.1.1.js'])
        .pipe(concat('about_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/company_js'));
});



gulp.task('commit_pay_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/commitPay/commitPayController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('commitPay_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/commit_pay_js'));
});

gulp.task('invitation_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/userCenter/userCenterController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/jsencrypt.js',
        './js/invitation/invitationController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('invitationCenter_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/invitation_js'));
});

gulp.task('jiesuan_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/jiesuan/jiesuanController.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('confirmOrder_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/jiesuan_js'));
});



gulp.task('logon_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/jsencrypt.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/myPlaceholderDirective.js',
        './js/sweetalert.min.js'])
        .pipe(concat('logon_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/logon_js'));
});

gulp.task('news_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/news/newsController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('news_list_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/news_js'));
});


gulp.task('news_detail_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/news/newsController.js',
        './js/newsDetail/newsDetailController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('newsDetail_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/news_detail_js'));
});

gulp.task('order_detail_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/orderDetail/orderDetailController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('orderDetail_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/order_detail_js'));
});

gulp.task('product_detail_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/productDetail/productDetailController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js',
        './js/jquery.fly.min.js',
        './js/requestAnimationFrame.js',
        './js/flyToCartService.js'])
        .pipe(concat('productDetail_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/product_detail_js'));
});

gulp.task('shopping_cart_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/login/loginController.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js',
        './js/angular-ui-router.min.js',
        './js/adaptiveOptBoxDirective.js'])
        .pipe(concat('cart_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/shopping_cart_js'));
});

gulp.task('user_center_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/userCenter/userCenterController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/jsencrypt.js',
        './js/sweetalert.min.js',
        './js/uploadService.js',
        './js/jquery.uploadify.min.js'])
        .pipe(concat('my_xxnr_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/user_center_js'));
});

gulp.task('fill_profile_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/userCenter/userCenterController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/jsencrypt.js',
        './js/sweetalert.min.js',
        './js/myPlaceholderDirective.js',
        './js/fillProfile/fillProfileController.js'])
        .pipe(concat('fillProfile_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/fill_profile_js'));
});

gulp.task('apply_county_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/userCenter/userCenterController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js',
        './js/myPlaceholderDirective.js',
        './js/fillProfile/applyCountyVeriController.js'])
        .pipe(concat('applyCountyVerified_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/applyCounty_js'));
});

gulp.task('xxnr_bigdata_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('xxnr_bigdata_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/xxnr_bigdata_js'));
});

gulp.task('xxnr_finance_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('xxnr_finance_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/xxnr_finance_js'));
});

gulp.task('xxnr_institute_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/shoppingCart/shoppingCartService.js',
        './js/login/loginService.js',
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/login/loginController.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js'])
        .pipe(concat('xxnr_institute_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/xxnr_institute_js'));
});

gulp.task('rsc_management_js_minify', function() {
    var revAll = new RevAll();
    gulp.src([
        './js/payService.js',
        './js/shoppingCart/shoppingCartController.js',
        './js/shoppingCart/shoppingCartService.js',
        './js/rscManagement/rscMgmtController.js',
        './js/login/loginController.js',
        './js/login/loginService.js',
        './js/headerFooterDirective.js',
        './js/headerController.js',
        './js/sweetalert.min.js',
        './js/uploadService.js',
        './js/sideService.js',
        './js/myPlaceholderDirective.js'])
        .pipe(concat('rsc_management_js.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./dev/js'))
        .pipe(revAll.revision())
        .pipe(gulp.dest('./production_js'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./rev/rsc_management_js'));
});



gulp.task('rev', function() {
    var manifest = gulp.src('./rev/**/*.json');
    gulp.src(['index.html',
        'car_list.html',
        'commitPay.html',
        'about.html',
        'huafei_list.html',
        'invitationCenter.html',
        'confirmOrder.html',
        'logon.html',
        'news_list.html',
        'newsDetail.html',
        'orderDetail.html',
        'productDetail.html',
        'cart.html',
        'my_xxnr.html',
        'list_template.html',
        'footer.html',
        'header.html',
        'fillProfile.html',
        'xxnr_bigdata.html',
        'xxnr_finance.html',
        'xxnr_institute.html',
        'applyCountyVerified.html',
        'shareApp.html',
        'rsc_management.html'
        ])
       //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(htmlreplace({
            css: 'production_css/styleAllInOne.css',
            js: {
                src: null,
                tpl: '<script src=production_js/framework_js.js></script><script src=production_js/%f_js.js></script>'
            }
        }))

        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest('./production_html'));                     //- 替换后的文件输出的目录
});

gulp.task('js_minify_all',
    [
        'index_js_minify',
        'car_js_minify',
        'huafei_js_minify',
        'company_js_minify',
        'commit_pay_js_minify',
        'invitation_js_minify',
        'jiesuan_js_minify',
        'logon_js_minify',
        'news_js_minify',
        'news_detail_js_minify',
        'order_detail_js_minify',
        'product_detail_js_minify',
        'shopping_cart_js_minify',
        'user_center_js_minify',
        'fill_profile_js_minify',
        'apply_county_js_minify',
        'xxnr_institute_js_minify',
        'xxnr_finance_js_minify',
        'xxnr_bigdata_js_minify',
        'rsc_management_js_minify'
    ]);


gulp.task('minify', ['css_minify','framework_js_minify','js_minify_all']);

gulp.task('release', function(done) {
    runSequence('minify', 'rev', function() {
        console.log('Run something else');
        done();
    });
});

gulp.task('watch', function () {
    gulp.watch('./css/*.css', ['css_minify','rev']);
});
