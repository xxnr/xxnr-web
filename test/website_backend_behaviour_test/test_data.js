/**
 * Created by pepelu on 2016/5/30.
 */
module.exports = {
    backend_admin:{
        account:'admin_test',
        password:'p@ssW0r$',
        role:'super_admin'
    },
    category_id:{
        '化肥':'531680A5',
        '汽车':'6C7D8F66'
    },
    test_product : {
        id:'testproductwithoutavalidid',
        category:'化肥',
        name:'测试商品',
        price:999999999,
        deposit:1,
        description:'测试商品描述',
        body:'<p>&nbsp;测试商品详情。<img src="test.jpg"></p>',
        standard:'<p>test standard</p>',
        support:'<p>test support</p>',
        app_body:'<p>&nbsp;测试app商品详情。<img src="test.jpg"></p>',
        app_standard:'<p>test app standard</p>',
        app_support:'<p>test app support</p>'
    },
    '化肥' : function(index){
        return {
            id:'testproductwithoutavalidid'+ index,
            category:'化肥',
            name:'测试商品'+ index,
            price:999999999,
            deposit:0,
            description:'测试商品描述'+ index,
            body:'<p>&nbsp;测试商品详情。<img src="test.jpg"></p>',
            standard:'<p>test standard</p>',
            support:'<p>test support</p>',
            app_body:'<p>&nbsp;测试app商品详情。<img src="test.jpg"></p>',
            app_standard:'<p>test app standard</p>',
            app_support:'<p>test app support</p>'
        }
    },
    '汽车' : function(index){
        return {
            id:'testproductwithoutavalidid'+ index,
            category:'汽车',
            name:'测试商品'+ index,
            istop:true,
            price:999999999,
            deposit:1,
            description:'测试商品描述'+ index,
            body:'<p>&nbsp;测试商品详情。<img src="test.jpg"></p>',
            standard:'<p>test standard</p>',
            support:'<p>test support</p>',
            app_body:'<p>&nbsp;测试app商品详情。<img src="test.jpg"></p>',
            app_standard:'<p>test app standard</p>',
            app_support:'<p>test app support</p>'
        }
    },
    test_SKU:{
        name:'test_sku',
        price:{
            market_price:10.1,
            platform_price:9.9
        },
        category:'531680A5'
    },
    test_user: {
        account: '13800000000',
        password: 'p@ssW0r$',
        wrong_password:'wrong_password',
        name: 'test_name',
        nickname: 'test_nickname',
        sex: true,
        RSCInfo: {
            name: 'test_RSC',
            IDNo: '10000000000000000X',
            phone: '13800000001',
            companyName: 'test_RSC_company'
        },
        user_address: [{
            detail: 'test_detail_address',
            receiptPhone: '13811111111',
            receiptPeople: 'test_potential_customer_receipt_name'
        }, {
            detail: 'test_detail_address_2',
            receiptPhone: '13800000000',
            receiptPeople: 'test_potential_customer_receipt_name_2'
        }],
        consignee: [{
            name: 'test_user_consignee_1',
            phone: '13811111111'
        }, {
            name: 'test_user_consignee_2',
            phone: '13800000000'
        }]
    },
    random_test_user: function(index){
        return {
            account: '1380000000' + index,
            password: 'p@ssW0r$',
            name: 'test_name' + index,
            nickname: 'test_nickname' + index,
            sex: true,
            RSCInfo: {
                name: 'test_RSC',
                IDNo: '10000000000000000X',
                phone: '13800000001',
                companyName: 'test_RSC_company'
            },
            user_address: [{
                detail: 'test_detail_address',
                receiptPhone: '13811111111',
                receiptPeople: 'test_potential_customer_receipt_name'
            }, {
                detail: 'test_detail_address_2',
                receiptPhone: '13800000000',
                receiptPeople: 'test_potential_customer_receipt_name_2'
            }],
            consignee: [{
                name: 'test_user_consignee_1',
                phone: '13811111111'
            }, {
                name: 'test_user_consignee_2',
                phone: '13800000000'
            }]
        }
    },
    test_address:{
        province:'河南',
        city:'郑州',
        county:'中原',
        town:'林山寨街道'
    },
    test_address_2:{
        province:'河南',
        city:'开封',
        county:'龙亭',
        town:'大兴街道'
    },
    potential_customer:{
        name:'test_potential_customer',
        phone:'13811111111',
        sex:true,
        remarks:'test potential customer remarks',
        namePinyin:'test_potential_customer',
        nameInitial:'T',
        nameInitialType:1,
        password:'password',
        user_address:{
            detail:'test_detail_address',
            receiptPhone:'13811111111',
            receiptPeople:'test_potential_customer_receipt_name'
        }
    },
    test_news:{
        id:'testnewsid',
        picture:'testimg',
        category:'测试资讯分类',
        title:'测试资讯标题',
        newsbody:'<p>abcdefg测试资讯body</p>',
        abstract:'测试资讯摘要'
    },
    RSC:function(index){
        return {
            name:'test RSC' + index,
            phone:'13800000000',
            IDNo:'10000000000000000X',
            companyName: 'test_RSC_company' + index
        }
    }
};