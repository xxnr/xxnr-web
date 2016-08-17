<template>
  <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreOrders" v-if="orders.length > 0">
    <div>
      <order-item v-if="orders.length != 0" :orders="orders"></order-item>
    </div>
  </scroller>
  <no-gift-orders v-else></no-gift-orders>
</template>

<script>
  import orderItem from './orderItem.vue'
  import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
  import xxnrToast  from '../../xxnr_mobile_ui/xxnrAlert.vue'
  import noGiftOrders from './noGiftOrders.vue'
  import api from '../../api/remoteHttpApi'
  import {scrollerHandler} from "./scrollerHandler"
  import {getTime} from '../../utils/common'
  //import {checkOtherPlaceLogin} from '../../utils/authService'
  export default{
    data(){
    return{
      type:2,
      currentPage:1,
      orders:[],
      end:false,
      toastShow:false,
      toastMsg:'',
      isEmpty: false
    }
  },
  components:{
    orderItem,
    Scroller,
    xxnrToast,
    noGiftOrders
  },
  methods:{
    loadMoreOrders:scrollerHandler,
    getOrders:function(pageNum){
      api.getGiftOrderList(
        {'type':this.type,'page':pageNum, 'max': 20},
          response => {
            if(response.data.code != '1000') {
              //TODO
              return;
            }

            if(pageNum==response.data.pages){
              this.end = true;
            }
            var resData = response.data.datas;
            if(response.data.datas.total != 0 && response.data.datas.giftorders) {
              for(let i = 0; i < resData.giftorders.length; i++) {
                resData.giftorders[i].dateCreated = getTime(new Date(resData.giftorders[i].dateCreated), 'yyyy-MM-dd hh:mm')
              }
            }
//            console.log(resData);
            this.orders = this.orders.concat(resData.giftorders);
            this.$broadcast('resetHeightScrollTop');
        }, response => {
          //TODO
        })
    }
  },
  created(){
  },
  route: {
    activate(){
      this.currentPage = 1;
      this.orders = [];
      this.end = false;
      this.getOrders(this.currentPage);
      this.$parent.currentTab = this.type;
      this.$broadcast('resetHeightScrollTop',true);
    }
  }
  }
</script>

<style>
</style>
