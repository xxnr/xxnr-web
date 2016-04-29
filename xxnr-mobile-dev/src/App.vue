<template>
    <xxnr-header></xxnr-header>
    <router-view keep-alive></router-view>
</template>
<script>
  import ProductItem from './components/product-item.vue'
  import XxnrHeader from './components/XxnrHeader.vue'
  import store from './vuex/store'

  export default {
    store,
    components: {
      ProductItem, XxnrHeader
    },
    ready() {
      this.$broadcast('slider')
    }
  }
</script>
<style>
  html, body, p, div, ul, li, a, span {
    border: 0;
    padding: 0;
    margin: 0;
  }

  body {
    font-family: "Microsoft YaHei", "Lucida Sans Unicode", "Myriad Pro", "Hiragino Sans GB", "Heiti SC", Verdana, simsun;
    background-color: #F5F5F5;
    color: #595757;
  }

  .clear {
    height: 0;
    width: 0;
    line-height: 0;
    font-size: 0;
    float: none;
    clear: both;
  }

  input[type="radio"] {
    display: none;
  }

  label {
    background: #CCC;
    display: inline-block;
    cursor: pointer;
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }


</style>
