<template>
  <log-tab :current-tab = currentTab></log-tab>
  <router-view></router-view>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle, getGiftOrderList } from '../../vuex/actions'
  import logTab from './logTab.vue'
  import orderItem from './orderItem.vue'

  export default {
    data(){
      return {
        currentTab: 1
      }
    },
    vuex: {
      getters: {
      },
      actions: {
        showBackBtn,
        hideRightBtn,
        editTitle
      }
    },
    components: {
      logTab,
      orderItem
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('兑换记录');
      }
    }
  }
</script>

<style scoped>


</style>
