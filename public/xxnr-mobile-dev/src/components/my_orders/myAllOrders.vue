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
    import {checkOtherPlaceLogin} from '../../utils/authService'
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
                checkOtherPlaceLogin(response,this);

                if(pageNum<=response.data.pages){
                //console.log(response);
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
