<template>
  <div class="productsRows clearfix">
    <div class="productRow" v-for="product in products">
      {{product.goodsName}}
    </div>

  </div>
</template>

<script>
  export default {
    props: ['products']
  }
</script>

<style>
  .productRow{
    height: 120px;
  }
</style>
