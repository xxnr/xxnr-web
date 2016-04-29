<template>
  <div class="mobile-header">
    {{headerTitle}}
    <div class="header-bit header-back">{{backButtonDisplay}}</div>
    <div class="header-bit header-right">{{rightButton}}</div>
  </div>
</template>

<script>
  export default {
    vuex: {
      getters: {
        headerTitle: function (state) {
          return state.header.headerTitle
        },
        rightButton: function (state) {
          return state.header.rightButton
        },
        backButtonDisplay: function (state) {
          return state.header.backButtonDisplay
        }
      },
      actions: {
      }
    }
  }
</script>

<style>
  .mobile-header {
    background-color: #00CC99;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    /*font-weight: bold;*/
  }
  .header-bit {
    position: absolute;
    top: 0;
    height: 30px;
    line-height: 30px;
  }
  .header-back {
    left: 2%;
  }

  .header-right {
    right: 2%;
  }
</style>
