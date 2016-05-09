import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import { configRouter } from './route-config'
// install router
Vue.use(VueRouter)

// create router
const router = new VueRouter({
  //history: true,
  saveScrollPosition: true
})

// configure router
configRouter(router)

router.start(Vue.extend(App), '#root')
// just for debugging
window.router = router





