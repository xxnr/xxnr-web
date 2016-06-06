<template>
  <div v-show="windowOffsetTop > 0" class="backToTop-container">
    <img @click="backToTop()" src="../../static/assets/images/backToTop.png" alt="">
  </div>
</template>
<style>
  .backToTop-container{
    position: fixed;
    bottom: 30px;
    right: 30px;
  }
  .backToTop-container img{
    width: 30px;
    height: 30px;
  }

</style>
<script>
    export default{
      data: function () {
        return {
          windowOffsetTop: $(window)[0].pageYOffset
        }
      },
      methods: {
        backToTop:function(){
          $(window).scrollTop(0); // include Zepto by webpack plugin
        }
      },
      created () {
        let that = this;
        $(window).on('scroll',function(){
          that.windowOffsetTop = $(window)[0].pageYOffset;
        });
      }
    }
</script>
