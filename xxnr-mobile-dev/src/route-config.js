import {getCookie} from './utils/authService'

export function configRouter (router) {
  // normal routes
  router.map({
    '/home': {
      component: require('./components/home/index.vue')
    },
    '/6C7D8F66':{
      component: require('./components/carsSession/index.vue')
    },
    '/531680A5':{
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
	  '/productDetail': {
      component: require('./components/productDetail/index.vue')
    },
    '/order': {
      component: require('./components/order/index.vue')
    },
    '/orderRSC': {
      component: require('./components/order/RSCList.vue')
    },
    '/register':{
      component: require('./components/register/index.vue')
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
