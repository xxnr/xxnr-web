<template>
  <div class="productsRows clearfix">
    <div class="productRow" v-for="product in products">
      <a v-link="{path: '/productDetail?id=' + product.goodsId}">
        <div class="product-img">
          <img :src="product.imgUrl">
        </div>
        <div class="product-info">
          <div class="product-name">
            {{product.goodsName}}
          </div>
          <div class="product-presale" v-if="product.presale">
            即将上线
          </div>
          <div class="product-price" v-else>
            {{product.onSale ? '¥'+ product.unitPrice : '¥'+ product.originalPrice}}
          </div>
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
  .productsRows {
    background-color: #fff;
    padding: 0 2%;
    margin-top: 5px;
  }

  .productRow{
    height: 100px;
    position: relative;
    padding: 8px 0;
    border-bottom: 1px solid #c7c7c7;
  }

  .product-img {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 1px solid #c7c7c7;
  }

  .product-img img {
    width: 100%;
  }

  .product-info {
    position: absolute;
    left: 112px;
  }

  .product-price {
    color: #ff4e00;
    position: absolute;
    top: 60px;
  }

  .product-name {
    line-height: 18px;
    font-size: 14px;
    height: 36px;
    overflow: hidden;
  }

  .product-presale {
    position: absolute;
    top: 60px;
    color: #909090;
  }
</style>
