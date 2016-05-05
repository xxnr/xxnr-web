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
    }
  });

  //默认/重定向到home页
  router.redirect({
    '/': "/home"
  });
}
