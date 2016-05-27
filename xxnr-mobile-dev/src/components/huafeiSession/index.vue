<template>
  <div class="container">
    <products-rows-list :products="huafeiRows"></products-rows-list>
  </div>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getHuafeiRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        huafeiRows:state => state.rowsViewProducts.rowsViewHuafei
      },
      actions:{
        getHuafeiRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn
      }
    },
    components: {
      ProductsRowsList
    },
    route: {
      activate(){
        this.changeRightBtnMyXXNR();
        this.changeRightBtnPathMyxxnr();
        this.showBackBtn();
        this.showRightBtn();
      }
    },
    created () {
      this.getHuafeiRowsViewCars();
    }
  }
</script>

<style>



</style>
