<template>
  <div class="is-end">
    <div class="is-end-line"></div>
    <p>已到最后</p>
  </div>
</template>

<script>

</script>

<style scoped>
  .is-end {
    position: relative;
    height: 15px;
    line-height: 15px;
    margin: 20px 2% 0px;
    /*background: url('/static/assets/images/is_end.png') 0 0 repeat-x;*/
    padding-bottom: 10px;
  }

  .is-end p {
    position: absolute;
    background-color: #fafafa;
    padding: 0 10px;
    width: 50px;
    font-size: 12px;
    left: 48%;
    margin-left: -25px;
    color: #c0c0c0;
  }

  .is-end-line {
    width: 100%;
    border-top: 1px solid #eee;
    position: absolute;
    top: 7px;
  }
</style>
