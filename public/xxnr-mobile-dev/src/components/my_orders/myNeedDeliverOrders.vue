<template>
  <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreOrders">
    <div class="orders-list">
      <orders-list :orders="orders"></orders-list>
    </div>
  </scroller>
</template>

<script>
  import ordersList from '../ordersList.vue'
  import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
  import api from '../../api/remoteHttpApi'
  import {scrollerHandler} from "./scrollerHandler"
  import xxnrAlert from '../../xxnr_mobile_ui/xxnrAlert.vue'

  export default{
    data(){
      return{
        typeValue:2,
        currentPage:1,
        orders:[],
        end:false,
      }
    },
    components:{
      ordersList,
      Scroller,
      xxnrAlert
    },
    methods:{
      loadMoreOrders:scrollerHandler,
      getOrders:function(pageNum){
        api.getOrdersList(
          {'typeValue':this.typeValue,'page':pageNum},
          response => {
          if(response.data.code==1401){
            this.alertShow= true;
            this.alertMessage = "你已在其他地方登录,请重新登录"
          }
          if(pageNum<=response.data.pages){
          //              console.log(response);
          if(pageNum==response.data.pages){
            this.end = true;
          }
          this.orders = this.orders.concat(response.data.items);
          this.$broadcast('resetHeightScrollTop',false);
        }
      }, response => {
          console.log(response);
        })
      }
    },
    created(){
//      this.orders = [];
//      this.getOrders(this.currentPage);
    },
    route: {
      activate(){
        this.currentPage = 1,
        this.orders = [],
        this.end = false,
        this.getOrders(this.currentPage);
        this.$parent.selectedTab = this.typeValue;

      }
    }
  }
</script>

<style>
</style>
