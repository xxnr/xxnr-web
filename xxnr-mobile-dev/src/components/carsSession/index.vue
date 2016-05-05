<template>
  <div class="container">
    <products-rows-list :products="carsRows"></products-rows-list>
  </div>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getCarsRowsViewCars,hideBackBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        carsRows:state => state.rowsViewProducts.rowsViewCars
      },
      actions:{
        getCarsRowsViewCars,hideBackBtn
      }
    },
    components: {
      ProductsRowsList
    },
    created () {
      this.getCarsRowsViewCars();
    },
    route: {
        canDeactivate (transition) {
        //when back to /home hide the backBtn
        if (transition.to.path === '/home') {
          this.hideBackBtn();
        }
        transition.next()
      }
    }
  }
</script>

<style>



</style>
