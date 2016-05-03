<template>
  <div class="products clearfix">
    <a href="">
      <div class="product" v-for="product in products">
        {{product.name}}
      </div>
    </a>
  </div>
</template>

<script>
  export default {
    props: ['products']
  }
</script>

<style>
  .products div{
    float: left;
  }
  .product{
    height: 200px;
    width: 50%;
  }
</style>
