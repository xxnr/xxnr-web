<template>
  <products-rows-list :products="carsRows"></products-rows-list>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        carsRows:state => state.rowsViewProducts.rowsViewCars
      },
      actions:{
        getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr
      }
    },
    components: {
      ProductsRowsList
    },
    created () {
      this.getCarsRowsViewCars();
      this.showBackBtn();
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
  }
</script>

<style>



</style>
