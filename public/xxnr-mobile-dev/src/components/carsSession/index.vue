<template>
  <products-rows-list :products="carsRows"></products-rows-list>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        carsRows:state => state.rowsViewProducts.rowsViewCars
      },
      actions:{
        getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn
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
      activate(){
        this.showBackBtn();
        this.showRightBtn();
        this.changeRightBtnMyXXNR();
        this.changeRightBtnPathMyxxnr();
      }
    },
  }
</script>

<style>



</style>
