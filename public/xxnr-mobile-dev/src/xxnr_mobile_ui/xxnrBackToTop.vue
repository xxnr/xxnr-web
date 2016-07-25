<template>
  <div class="backToTop-container" v-show="canBackToTop > 0">
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
      props:['canBackToTop'],
      data: function () {
        return {
          windowOffsetTop: $(window)[0].pageYOffset
        }
      },
      methods: {
        backToTop:function(){
          this.$dispatch('backToTopParent');
        }
      },
      created () {
        let that = this;
        $(window).on('scroll',function(){
          that.windowOffsetTop = $(window)[0].pageYOffset;
        });
      },
      route: {
        activate() {
          let that = this;
          $(window).on('scroll',function(){
            that.windowOffsetTop = $(window)[0].pageYOffset;
          });
        }
      }
    }
</script>
