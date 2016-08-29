<template>
  <iframe name="rule" id="rule" onload="this.height = rule.document.body.scrollHeight" width="100%" scrolling="no" frameborder="0" src="/rewardshop/rules">
  </iframe>
</template>
<script>
  import { showBackBtn,hideRightBtn,editTitle } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
      },
      actions:{
        showBackBtn,
        hideRightBtn,
        editTitle
      }
    },
    components:{
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('积分规则');
      }
    }
  }
</script>
<style>

</style>
