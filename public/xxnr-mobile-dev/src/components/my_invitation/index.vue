<template>
  <div class="my_invitation--section">
    <img class="my_invitation--logo" src="/assets/images/invitation_icon.png" alt="">
    <div class="hasInviter" v-if="hasInviter">
      新农代表：{{hasInviter}}
    </div>
    <div v-else class="addInviter clearfix">
      <input class="roundInput" type="text" v-model="inviterPhone" placeholder="输入代表人手机号进行添加">
      <button class="xxnr_Btn" @click="bindInviter(inviterPhone)">
        添加
      </button>
    </div>
  </div>
</template>

<script>
  import { bindInviter,getUserInfo,showBackBtn,hideRightBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        user : state => state.auth.user,
        hasInviter : state => state.auth.userInfo.inviter
      },
      actions:{
        bindInviter,
        getUserInfo,
        showBackBtn,
        hideRightBtn
      }
    },
    components:{
    },
    created () {
      this.getUserInfo(this.user.userId);
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
      }
    },
  }
</script>

<style>
  .my_invitation--logo{
    display: block;
    margin: 105px auto;
    margin-bottom: 50px;
    height: 70px;
    width: 70px;
  }
  .roundInput{
    float: left;
    width: 240px;
    margin-left: 12px;
  }
  .hasInviter{
    text-align: center;
  }
  .addInviter .xxnr_Btn{
    float: left;
    height: 35px;
    width: 40px;
  }
  .addInviter{
    text-align: center;
    width: 310px;
    margin: 0 auto;
  }
</style>
