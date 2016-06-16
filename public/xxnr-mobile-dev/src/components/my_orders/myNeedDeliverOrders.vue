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
  import xxnrAlert from '../../xxnr_mobile_ui/xxnrAlert.vue'
  import api from '../../api/remoteHttpApi'
  import {scrollerHandler} from "./scrollerHandler"
  import {checkOtherPlaceLogin} from '../../utils/authService'

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
      console.log('order');
      api.getOrdersList(
        {'typeValue':this.typeValue,'page':pageNum},
        response => {
        checkOtherPlaceLogin(response,this);

      if(pageNum<=response.data.pages){
        //console.log(response);
        if(pageNum==response.data.pages){
          this.end = true;
        }
        var orderData = response.data.items;
        for(let i = 0; i < orderData.length;i++) {
          if(orderData[i].order.orderStatus.type == 4) {
            orderData[i].isShowC = false;
            for(let j =0; j < orderData[i].SKUs.length; j++) {
              if(orderData[i].SKUs[j].deliverStatus == 2) {
                orderData[i].isShowC = true;
                break;
              }
            }
          } else if(orderData[i].order.orderStatus.type == 5) {
            orderData[i].isShowD = false;
            for(let j =0; j < orderData[i].SKUs.length; j++) {
              if(orderData[i].SKUs[j].deliverStatus == 4) {
                orderData[i].isShowD = true;
                break;
              }
            }
          }
        }
        this.orders = this.orders.concat(orderData);
        this.$broadcast('resetHeightScrollTop');
      }
    }, response => {
      console.log(response);
    })
  }
  },
  created(){
  },
  route: {
    activate(){
      this.currentPage = 1,
        this.orders = [],
        this.end = false,
        this.getOrders(this.currentPage);
      console.log(this.typeValue);
      this.$parent.selectedTab = this.typeValue;
      this.$broadcast('resetHeightScrollTop',true);
    }
  }
  }
</script>

<style>
</style>
