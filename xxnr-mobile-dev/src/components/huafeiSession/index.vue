<template>
  <div class="container">
    <products-rows-list :products="huafeiRows"></products-rows-list>
  </div>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getHuafeiRowsViewCars,hideBackBtn,showBackBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        huafeiRows:state => state.rowsViewProducts.rowsViewHuafei
      },
      actions:{
        getHuafeiRowsViewCars,hideBackBtn,showBackBtn
      }
    },
    components: {
      ProductsRowsList
    },
    route: {
      canDeactivate (transition) {
        //when back to /home hide the backBtn
        if (transition.to.path === '/home') {
          this.hideBackBtn();
        }
        transition.next()
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
