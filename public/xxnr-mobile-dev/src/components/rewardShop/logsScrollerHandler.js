/**
 * Created by songshuang on 2016/8/9.
 */
export function logsScrollerHandler(uuid) {
  const _this = this;
  if(_this.end){
    _this.$broadcast('pullup:done',uuid)
  }else{
    _this.getLogs(++_this.currentPage);
  }
}
