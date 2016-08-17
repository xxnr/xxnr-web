<template>
    <xxnr-header></xxnr-header>
    <div class="mainContainer">
      <router-view keep-alive></router-view>
    </div>
</template>
<script>
  import xxnrHeader from './components/xxnrHeader.vue'
  import store from './vuex/store'

  export default {
    store,
    components: {
      xxnrHeader
    },
    ready() {

    }
  }
</script>
<style>
  @import './xxnr_mobile_ui/vux.css';
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
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    -webkit-text-size-adjust: none;
  }
  input {
    border: none;
    _border: 0;
    outline: none;
    background: none;
    font-family: "Microsoft YaHei","Arial";
    border-radius: 0;
    opacity: 1;
  }

  button {
    font-family: "Microsoft YaHei";
  }

  input[type=button] {
    -webkit-appearance: none;
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
  a,button,input,textarea{
    -webkit-tap-highlight-color: rgba(0,0,0,0)
    /*-webkit-user-modify:read-write-plaintext-only;*/
  }
  .mainContainer{
    padding-top: 44px;
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
    z-index: 99;
  }

  .gift-bottom {
    position: fixed;
    width: 100%;
    height: 49px;
    bottom: 0;
    z-index: 100;
    border-top: 1px solid #c7c7c7;
    background-color: #fff;
  }

  .gift-bottom-btn {
    width: 80%;
    height: 34px;
    margin: 8px 0 0 10%;
    color: #fff;
    font-size: 16px;
    text-align: center;
    line-height: 34px;
    background-color: #FE9B00;
    border-radius: 3px;
  }

  .gift-bottom-btn:active {
    background-color: #FEC366;
    -webkit-user-select: none;
  }

</style>
