<template>
  <scroller v-ref:scroller lock-x scrollbar-y use-pullup @pullup:loading="loadMoreLogs" v-if="logs && logs.length > 0">
    <div class="log-list">
      <logs-top :score="score"></logs-top>
      <log-item :logs="logs"></log-item>
      <is-end v-if="end"></is-end>
    </div>
  </scroller>
  <no-point-logs v-else></no-point-logs>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle, getPointsLogs, getUserPoint } from '../../vuex/actions'
  import noPointLogs from './noPointLogs.vue'
  import isEnd from './isEnd.vue'
  import logItem from './logItem.vue'
  import logsTop from './logsTop.vue'
  import Scroller from '../../xxnr_mobile_ui/xxnrScroller.vue'
  import {logsScrollerHandler} from './logsScrollerHandler'
  import api from '../../api/remoteHttpApi'
  import {getTime} from '../../utils/common'

  export default {
    data(){
      return {
        currentPage:1,
        logs:[],
        end:false,
        isEmpty: false
      }
    },
    vuex:{
      getters:{
        score: state => state.point.score
      },
      actions:{
        showBackBtn,
        hideRightBtn,
        editTitle,
        getUserPoint,
        getPointsLogs
      }
    },
    methods: {
      loadMoreLogs: logsScrollerHandler,
      getLogs:function(pageNum){
        api.getPointsLogs(
          {'page':pageNum, 'max': 20},
          response => {
          if(response.data.code == '1401') {
            router.go('/login?ref=/myPoint');
            return;
          }
          if(response.data.code != '1000') {
            //TODO
            return;
          }
          if(pageNum==response.data.datas.pages){
            this.end = true;
          }
          var resData = response.data.datas.pointslogs;
          for(let i = 0; i < resData.length; i++) {
            resData[i].date = resData[i].date ? getTime(new Date(resData[i].date),'yyyy-MM-dd') : '';
          }
          this.logs = this.logs.concat(resData);
          this.$broadcast('resetHeightScrollTop');
        }, response => {
          //TODO
        })
      }
    },
    components:{
      noPointLogs,
      isEnd,
      logItem,
      Scroller,
      logsTop
    },
    route: {
      activate(){
        this.currentPage = 1;
        this.logs = [];
        this.end = false;
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('我的积分');
        this.getUserPoint();
        this.getLogs(this.currentPage);
        this.$broadcast('resetHeightScrollTop',true);
      }
    }
  }
</script>

<style scoped>

  .my-point-top div {
    line-height: 30px;
  }

  .log-list {
    /*padding-top: 86px;*/
  }

</style>
