import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import homeView from './views/home.vue'
//new Vue({
//  el: 'body',
//  store,
//  components: { App }
//});
Vue.use(VueRouter);
var router = new VueRouter();
router.map({
  '/home': {
    component: homeView
  }
});
//默认/重定向到home页
router.redirect({
  '/': "/home"
});
router.start(Vue.extend(App), '#root')
window.router = router





