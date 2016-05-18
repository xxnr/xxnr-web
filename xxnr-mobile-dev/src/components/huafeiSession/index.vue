<template>
  <div class="container">
    <products-rows-list :products="huafeiRows"></products-rows-list>
  </div>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getHuafeiRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        huafeiRows:state => state.rowsViewProducts.rowsViewHuafei
      },
      actions:{
        getHuafeiRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr
      }
    },
    components: {
      ProductsRowsList
    },
    route: {
      deactivate (transition) {
        //when back to /home hide the backBtn
        if (transition.to.path === '/home') {
          this.changeRightBtnMyXXNR();
          this.changeRightBtnPathMyxxnr();
        }
        transition.next()
      },
      activate(){
        this.showBackBtn();
      }
    },
    created () {
      this.getHuafeiRowsViewCars();
      this.showBackBtn();
    }
  }
</script>

<style>



</style>
