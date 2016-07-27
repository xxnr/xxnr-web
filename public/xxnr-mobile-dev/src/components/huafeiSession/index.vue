<template>
  <div class="container">
    <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreHuafeis">
      <products-rows-list :products="huafeiRows"></products-rows-list>
    </scroller>
    <xxnr-back-to-top :can-back-to-top = canBackToTop></xxnr-back-to-top>
  </div>
</template>

<script>
  import ProductsRowsList from '../ProductsRowsList.vue'
  import { getHuafeiRowsViewCars ,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn,editTitle } from '../../vuex/actions'
  import xxnrBackToTop from '../../xxnr_mobile_ui/xxnrBackToTop.vue'
  import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
  import {scrollerHandler} from "./scrollerHandler"
  import api from '../../api/remoteHttpApi'
  export default {
    data(){
    return{
      currentPage:1,
      huafeiRows:[],
      end:false,
      canBackToTop: 0
    }
  },
  vuex:{
    getters:{
      huafeiRows:state => state.rowsViewProducts.rowsViewHuafei
    },
    actions:{
      getHuafeiRowsViewCars,hideBackBtn,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,showRightBtn,editTitle
    }
  },
  methods: {
    loadMoreHuafeis: scrollerHandler,
    getHuafeiList: function(pageNum) {
      api.getProductsListPage(
        {classId:'531680A5',page:pageNum,rowCount:10},
        response => {
        if(pageNum <= response.data.datas.pages){
          if(pageNum == response.data.datas.pages){
            this.end = true;
          }
          this.huafeiRows = this.huafeiRows.concat(response.data.datas.rows);
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
  events: {
    'backToTopParent': function() {
      this.$broadcast('backToTop');
    },
    'canBackToTop': function(scrollTop) {
      this.canBackToTop = scrollTop;
    }
  },
  created () {
    this.getHuafeiRowsViewCars();
    this.showBackBtn();
  },
  route: {
    activate(){
      this.showBackBtn();
      this.showRightBtn();
      this.changeRightBtnMyXXNR();
      this.changeRightBtnPathMyxxnr();
      this.editTitle('化肥专场');
      this.currentPage = 1,
      this.huafeiRows = [],
      this.end = false,
      this.getHuafeiList(this.currentPage);
      this.$broadcast('resetHeightScrollTop',true);
    }
  }
  }
</script>

<style>



</style>
