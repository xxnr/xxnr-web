<template>
  <div class="products clearfix">
    <div class="product" v-for="product in products">
      <a v-link="{path: '/productDetail?id=' + product.id}">
      <div class="product-img">
        <img :src="product.imgUrl">
      </div>
      <div class="product-name">{{product.name}}</div>
      <div class="product-presale" v-if="product.presale">
        即将上线
      </div>
      <div class="product-price" v-else>
        ¥{{product.price}}
      </div>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['products']
  }
</script>

<style scoped>
  .product{
    float: left;
    width: 49%;
    margin-left: 2%;
    margin-bottom: 15px;
    height: 220px;
  }

  .product:nth-child(2n+1) {
    margin-left: 0;
  }

  .product-name {
    font-size: 12px;
    line-height: 15px;
    height: 30px;
    overflow: hidden;
    margin-top: 5px;
  }

  .product-img {
    border: 1px solid #c7c7c7;
  }

  .product-img img{
    width: 100%;
    height: 150px;
  }

  .product-price {
    color: #ff4e00;
    font-size: 16px;
    line-height: 30px;
  }

  .product-presale {
    color: #909090;
    font-size: 16px;
  }
</style>
