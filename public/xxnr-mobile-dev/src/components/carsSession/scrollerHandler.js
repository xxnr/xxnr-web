/**
 * Created by xxnr-cd on 16/5/26.
 */
export function scrollerHandler(uuid) {
  const _this = this;
  if(_this.end){
    _this.$broadcast('pullup:done',uuid)
  }else{
    _this.getCarsList(++_this.currentPage);
  }
}
