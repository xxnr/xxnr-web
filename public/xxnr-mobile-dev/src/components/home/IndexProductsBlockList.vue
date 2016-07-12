<template>
  <div class="products clearfix">
    <div class="product" v-for="product in products">
      <a v-link="{path: '/productDetail?id=' + product.id}">
      <div class="product-img">
        <img :src="product.imgUrl" onerror="javascript:this.src='../../../static/assets/images/no_picture.png'">
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
  .product {
    float: left;
    width: 49%;
    margin-left: 2%;
    margin-bottom: 15px;
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
    overflow : hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .product-img {
    border: 1px solid #c7c7c7;
    overflow: hidden;
  }

  .product-img img{
    width: 100%;
  }

  .product-price {
    color: #ff4e00;
    font-size: 16px;
    line-height: 30px;
  }

  .product-presale {
    color: #909090;
    font-size: 16px;
    line-height:30px;
  }
</style>
