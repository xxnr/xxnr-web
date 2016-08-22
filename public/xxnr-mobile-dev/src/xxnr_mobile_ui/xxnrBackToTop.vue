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
      methods: {
        backToTop:function(){
          this.canBackToTop = 0;
          this.$dispatch('backToTopParent');
        }
      }
    }
</script>
