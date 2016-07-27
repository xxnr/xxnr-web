<template>
  <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreCars">
      <products-rows-list :products="carsRows"></products-rows-list>
  </scroller>
  <xxnr-back-to-top></xxnr-back-to-top>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn,editTitle } from '../../vuex/actions'
  import xxnrBackToTop from '../../xxnr_mobile_ui/xxnrBackToTop.vue'
  import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
  import {scrollerHandler} from "./scrollerHandler"
  import api from '../../api/remoteHttpApi'
  export default {
    data(){
      return{
        currentPage:1,
        carsRows:[],
        end:false
      }
    },
    vuex:{
      getters:{
        carsRows:state => state.rowsViewProducts.rowsViewCars
      },
      actions:{
        getCarsRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn,editTitle
      }
    },
    methods: {
      loadMoreCars: scrollerHandler,
      getCarsList: function(pageNum) {
        api.getProductsListPage(
          {classId:'6C7D8F66',page:pageNum,rowCount:10},
          response => {
            if(pageNum <= response.data.datas.pages){
              if(pageNum == response.data.datas.pages){
                this.end = true;
              }
              this.carsRows = this.carsRows.concat(response.data.datas.rows);
              this.$broadcast('resetHeightScrollTop');
            }
        }, response => {
        })
      }
    },
    components: {
      ProductsRowsList,
      xxnrBackToTop,
      Scroller
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
        this.editTitle('汽车专场');
        this.currentPage = 1,
        this.carsRows = [],
        this.end = false,
        this.getCarsList(this.currentPage);
        this.$broadcast('resetHeightScrollTop',true);
      }
    }
  }
</script>

<style>



</style>
