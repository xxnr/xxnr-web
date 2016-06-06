<template>
  <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreOrders">
    <div class="orders-list">
      <orders-list :orders="orders"></orders-list>
    </div>
  </scroller>
  <xxnr-alert :show.sync="alertShow" title="新新农人" link="/login">
    {{alertMessage}}
  </xxnr-alert>
</template>

<script>
    import ordersList from '../ordersList.vue'
    import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
    import xxnrAlert from '../../xxnr_mobile_ui/xxnrAlert.vue'
    import api from '../../api/remoteHttpApi'
    import {scrollerHandler} from "./scrollerHandler"

    export default{
        data(){
            return{
                typeValue:null,
                currentPage:1,
                orders:[],
                end:false,
                alertShow:false,
                alertMessage:''
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
                //console.log(response);
                  if(pageNum==response.data.pages){
                    this.end = true;
                  }
                  var orderData = response.data.items;
                  console.log(orderData);
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
                  this.$broadcast('resetHeightScrollTop',false);
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
//            this.selectedTab = 0;
            this.$parent.selectedTab = 0;
          }
        }
    }
</script>

<style>
</style>
