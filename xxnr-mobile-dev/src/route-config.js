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
    '/register':{
      component: require('./components/register/index.vue')
    },
    '/my_orders':{
      name:'myOrders',
      component: require('./components/my_orders/index.vue'),
      auth: true // 这里 auth 是一个自定义字段
      //subRoutes:{
      //  'allOrders': {
      //    name: 'myAllOrders', //具名路由
      //    component: require('./components/my_orders/myAllOrders.vue')
      //  },
      //  'nonPayment': {
      //    name: 'myNonPayment',
      //    component: require('./components/my_orders/myNonPayment.vue')
      //  },
      //  'nonDeliver': {
      //    name: 'myNonDeliver',
      //    component: require('./components/my_orders/myNonDeliver.vue')
      //  },
      //  'nonReceiving': {
      //    name: 'mynNonReceiving',
      //    component: require('./components/my_orders/myNonReceiving.vue')
      //  },
      //  'completed': {
      //    name: 'myCompleted',
      //    component: require('./components/my_orders/myCompleted.vue')
      //  }
      //}
    }
  });
  router.beforeEach((transition) => {
    if (transition.to.auth) {
      const user = getCookie('__user');
      if(!user){
        let redirect = encodeURIComponent(transition.to.path);
        transition.redirect('/login?redirect=' + redirect);
        //redirect 作为参数，登录之后跳转回来
      }else{
        transition.next();
      }
    }else{
      transition.next();
    }
  });
  //默认/重定向到home页
  router.redirect({
    '/': "/home"
  });


}
