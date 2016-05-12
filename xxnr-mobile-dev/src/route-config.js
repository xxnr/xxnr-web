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
      component: require('./components/login/index.vue')
    },
    '/register':{
      component: require('./components/register/index.vue')
    },
    '/my_orders':{
      component: require('./components/my_orders/index.vue'),
      subRoutes:{
        'allOrders': {
          name: 'myAllOrders', //具名路由
          component: require('./components/my_orders/myAllOrders.vue')
        },
        'nonPayment': {
          name: 'myNonPayment',
          component: require('./components/my_orders/myNonPayment.vue')
        },
        'nonDeliver': {
          name: 'myNonDeliver',
          component: require('./components/my_orders/myNonDeliver.vue')
        },
        'nonReceiving': {
          name: 'mynNonReceiving',
          component: require('./components/my_orders/myNonReceiving.vue')
        },
        'completed': {
          name: 'myCompleted',
          component: require('./components/my_orders/myCompleted.vue')
        }
      }
    }
  });

  //默认/重定向到home页
  router.redirect({
    '/': "/home"
  });
}
