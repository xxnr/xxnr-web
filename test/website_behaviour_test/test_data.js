/**
 * Created by pepelu on 2016/5/30.
 */
module.exports = {
    backend_admin:{
        account:'admin_test',
        password:'p@ssW0r$',
        role:'super_admin'
    },
    test_product : {
        id:'testproductwithoutavalidid',
        category:'化肥',
        name:'测试商品',
        istop:true,
        brandName:'不应该是这个品牌',
        price:999999999,
        deposit:1,
        description:'测试商品描述',
        body:'<p>&nbsp;测试商品详情。</p>',
        standard:'<p><img alt="" src="" style="height:2876px; width:879px" /></p>'
    },
    test_user:{
        account:'13800000000',
        password:'p@ssW0r$',
        name:'test_name',
        nickname:'test_nickname',
        RSCInfo:{
            name:'test_RSC',
            IDNo:'10000000000000000X',
            phone:'13800000001',
            companyName:'test_RSC_company'
        }
    }
};