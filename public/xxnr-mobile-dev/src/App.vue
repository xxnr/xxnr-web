<template>
    <xxnr-header></xxnr-header>
    <div class="mainContainer">
      <router-view keep-alive></router-view>
    </div>
</template>
<script>
  import XxnrHeader from './components/XxnrHeader.vue'
  import store from './vuex/store'

  export default {
    store,
    components: {
      XxnrHeader
    },
    ready() {

    }
  }
</script>
<style>
  /*some common css style */
  [v-cloak] { display: none }
  html, body, p, div, ul, li, a, span {
    border: 0;
    padding: 0;
    margin: 0;
  }

  body {
    font-family: "Microsoft YaHei", "Lucida Sans Unicode", "Myriad Pro", "Hiragino Sans GB", "Heiti SC", Verdana, simsun;
    background-color: #fafafa;
    color: #595757;
  }
  input {
    border: none;
    _border: 0;
    outline: none;
    background: none;
    font-family: "Microsoft YaHei";
  }
  em {
    font-style: normal;
  }
  li {
    list-style: none;
    vertical-align: top;
  }
  img {
    border: none;
    vertical-align: top;
  }
  a {
    text-decoration: none;
    outline: none;
    color: #333;
  }
  .clear {
    height: 0;
    width: 0;
    line-height: 0;
    font-size: 0;
    float: none;
    clear: both;
  }
  .clearfix:before, .clearfix:after {
    content: " ";
    /* 1 */
    display: table;
    /* 2 */
  }
  .clearfix:after {
    clear: both;
  }

  /*** For IE 6/7 only * Include this rule to trigger hasLayout and contain floats.*/

  .clearfix {
    *zoom: 1;
  }

  input[type="radio"] {
    display: none;
  }
  .roundInput{
    border: 1px solid #C7C7C7;
    border-radius: 5px;
    color:#B0B0B0;
    height: 35px;
    padding-left: 10px;
    font-size: 18px;
    box-sizing: border-box;
  }
  .xxnr_Btn{
    background: #00B38A;
    border-radius: 5px;
    border: 0px;
    color: #FBFFFE;
  }

  label {
    background: #CCC;
    display: inline-block;
    cursor: pointer;
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }
  .mainContainer{
    padding-top: 30px;
  }
  @keyframes fadein {
     from { opacity: 0; }
     to   { opacity: 1; }
   }

  /* Firefox < 16 */
  @-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Safari, Chrome and Opera > 12.1 */
  @-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Internet Explorer */
  @-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Opera < 12.1 */
  @-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  /* Firefox < 16 */
  @-moz-keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  /* Safari, Chrome and Opera > 12.1 */
  @-webkit-keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  /* Internet Explorer */
  @-ms-keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  /* Opera < 12.1 */
  @-o-keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: .6;
    z-index: 100;
  }

</style>
