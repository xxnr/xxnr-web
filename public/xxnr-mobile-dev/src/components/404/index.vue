<template>
    <div>
      Not Found 404!
      <a v-link="{ path: '/home'}">回到首页</a>
    </div>
</template>
<style>
</style>
<script>
    import {
      showBackBtn
    } from '../../vuex/actions'

    export default{
      vuex: {
        getters: {

        },
        actions: {
          showBackBtn
        }
      },
      data(){
        return{
        }
      },
      components:{

      },
      route: {
        activate (transition) {
          this.showBackBtn();
          transition.next();
        }
      }
    }
</script>
