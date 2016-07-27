import {getCookie} from './utils/authService'

export function configRouter (router) {
  //因为链接不能加#!以区分前端路由还是后端路由,所以需要在后端服务器最后加一个路由正则以匹配到前端的路由  (mobileRelease.js)

  // normal routes
  router.map({
    '/home': {
      component: require('./components/home/index.vue')
    },
    '/cars':{
      name: '6C7D8F66',
      component: require('./components/carsSession/index.vue')
    },
    '/huafei':{
      name: '531680A5',
      component: require('./components/huafeiSession/index.vue')
    },
    '/my_xxnr':{
      component: require('./components/my_xxnr/index.vue')
    },
    '/login':{
      name: 'login', //具名路由
      component: require('./components/login/index.vue')
    },
    '/productDetail': {
        component: require('./components/productDetail/index.vue')
	  },
    '/order': {
      component: require('./components/order/index.vue'),
      auth: true
    },
    '/orderRSC': {
      component: require('./components/order/RSCList.vue')
    },
    '/orderConsignee': {
      component: require('./components/order/ConsigneeList.vue')
    },
    '/offlinePay': {
      component: require('./components/order/offlinePay.vue')
    },
    '/orderDone': {
      component: require('./components/order/orderDone.vue')
    },
    '/selfDelivery': {
      component: require('./components/order/selfDelivery.vue')
    },
    '/register':{
      component: require('./components/register/index.vue')
    },
    '/userAgreement':{
      component: require('./components/register/userAgreement.vue')
    },
    '/my_orders':{
      name:'myOrders',
      component: require('./components/my_orders/index.vue'),
      auth: true, // 这里 auth 是一个自定义字段
      subRoutes : {
        '/myAllOrders' : {
          component : require('./components/my_orders/myAllOrders.vue'),
        },
        '/myPayingOrders' : {
          component : require('./components/my_orders/myNeedPayOrders.vue'),
        },
        '/myConfirmingOrders' : {
          component: require('./components/my_orders/myNeedConfirmOrders.vue'),
        },
        '/myDeliveringOrders' : {
          component: require('./components/my_orders/myNeedDeliverOrders.vue'),
        },
        '/myCompletedOrders' : {
          component: require('./components/my_orders/myCompletedOrders.vue'),
        }
      }
    },
    '/my_points': {
      name: 'myPoints',
      component: require('./components/my_points/index.vue'),
      auth: true // 这里 auth 是一个自定义字段
    },
    '/my_invitation': {
      name: 'myInvitation',
      component: require('./components/my_invitation/index.vue'),
      auth: true // 这里 auth 是一个自定义字段
    },
    "*path": {
      component: require('./components/404/index.vue'),
    }
  });
  router.beforeEach((transition) => {
    if (transition.to.auth) {
      const user = getCookie('__user');
      if(!user){
        let redirect = encodeURIComponent(transition.to.path);
        transition.redirect('/login?redirect=' + redirect);
        //redirect 作为参数，登录之后跳转回来
        //console.log('Wrong way!');
      }else{
        transition.next();
      }
    }else{
      transition.next();
    }
  });
  //默认/重定向到home页
  router.redirect({
    '/': "/home",
    'my_orders':'my_orders/myAllOrders'
  });


}
