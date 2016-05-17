/**
 * Created by pepelu on 2016/5/12.
 */
module.exports = {
    test: {
        BaseUrl:'http://101.200.194.203/',
        huafei_list_page_path:'huafei_list.html',
        car_list_page_path:'car_list.html',
        news_list_page_path:'news_list.html',
        about_page_path:'about.html',
        logon_page_path:'logon.html',
        my_xxnr_page_path:'my_xxnr.html',
        user: {
            account: '15110102070',
            wrong_password: 'wrongpassword',
            right_password: '123456',
            nickname: '大水怪'
        },
        user_without_user_info:{
            account:'18518671828',
            right_password:'111111'
        },
        user_without_agent:{
            account:'15110102070',
            right_password:'123456'
        },
        unregistered_user:'18600000000',
        news_tabs:['', 'nongyexinwen', 'gongsidongtai', 'hangqingfenxi', 'zhihuinongye']
    },
    production:{
        BaseUrl:'http://www.xinxinnongren.com/',
        huafei_list_page_path:'huafei_list.html',
        car_list_page_path:'car_list.html',
        news_list_page_path:'news_list.html',
        about_page_path:'about.html',
        logon_page_path:'logon.html',
        my_xxnr_page_path:'my_xxnr.html',
        user:{
            account:'15110102070',
            wrong_password: 'wrongpassword',
            right_password:'123456',
            nickname:'水怪丙'
        },
        user_without_user_info:{
            account:'15690567307',
            right_password:'123456'
        },
        user_without_agent:{
            account:'15690567307',
            right_password:'123456'
        },
        unregistered_user:'18600000000',
        news_tabs:['', 'nongyexinwen', 'gongsidongtai', 'hangqingfenxi', 'zhihuinongye', 'xinxinnongren', 'xinnongzhifu']
    }
};