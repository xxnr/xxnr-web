<template>
  <div class="not-found-icon">
    <img src="/assets/images/four-icon.png">
  </div>
  <div class="not-found-wor">
    糟啦，页面找不到了~
  </div>
  <!--<div>-->
    <!--<a v-link="{ path: '/home'}">回到首页</a>-->
  <!--</div>-->
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

<style>
  .not-found-icon {
    width: 60%;
    margin-left: 17%;
    margin-top: 30px;
  }

  .not-found-icon img {
    width: 100%;
  }

  .not-found-wor {
    text-align: center;
    color: #707070;
    margin-top: 10px;
  }
</style>
