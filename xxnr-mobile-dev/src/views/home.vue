<template>
  <div class="container">
    <!-- pagination example -->
    <div class="timeline">
      <div
        class="item"
        @click='turnTo (1)'
        :class='{"active": slide.init.currentPage == 1}'
      ></div>
      <div
        class="item"
        @click='turnTo (2)'
        :class='{"active": slide.init.currentPage == 2}'
      ></div>
      <div
        class="item"
        @click='turnTo (3)'
        :class='{"active": slide.init.currentPage == 3}'
      ></div>
    </div>
    <slide :pages="someList" :slide="slide">
      <!-- slot  -->
      <div
        v-for="item in someList"
        class="slider-item page{{$index}}"
        :style="someList[$index].style">
        <h1>{{item.title}}</h1>
        <button @click="turnTo(($index+2))">to page{{$index+1}}</button>
      </div>

    </slide>
  </div>
  <div class="index-nav">
    <div class="nav-bit">1</div>
    <div class="nav-bit">2</div>
    <div class="nav-bit">3</div>
  </div>
  <div class="xxnr-title">
    xx精选
    <div class="title-more">更多产品</div>
  </div>
  <div class="container">
    <div class="clear"></div>
  </div>
  <div class="footer">
    <div class="container">
      <div class="footer-link">
        <a>移动版</a>
        <a>电脑版</a>
        <a>客户端</a>
      </div>
      <div class="footer-tel">客服电话：400-056-0371</div>
      <div class="footer-company">北京新新农人网络科技有限公司</div>
      <div>京ICP备15037751</div>
    </div>
  </div>
</template>

<script>
  import slide from '../components/vue-slide.vue'

  export default {
    data () {
      return {
        someList: [
          {
            title: '1',
            img: 'testimg-1.png',
            //slide init
            origin: 0,
            current: 0,
            style: {
              'background-image': 'url(./static/assets/images/testimg-1.png)',
              'background-size': 'cover',
              //transform
              'transform': `translateX(0%)`
            }
          },
          {
            title: '2',
            img: 'testimg-2.png',

            origin: 100,
            current: 0,
            style: {
              'background-image': 'url(./static/assets/images/testimg-2.png)',
              'background-size': 'cover',
              'transform': `translateX(${ 100 }%)`
            }
          },
          {
            title: '3',
            img: 'testimg-3.png',
            origin: 200,
            current: 0,
            style: {
              'background-image': 'url(./static/assets/images/testimg-3.png)',
              'background-size': 'cover',
              'transform': `translateX(${ 200 }%)`
            }
          }
        ],
        slide: {
          init: {
            pageNum: 3,
            currentPage: 1,
            canPre: false,
            canNext: true,
            start: {},
            end: {},
            tracking: false,
            thresholdTime: 500,
            thresholdDistance: 100
          }
        }
      }

    },
    methods: {
      turnTo(num)
      {
        console.log(num)
        this.$broadcast('slideTo', num)
      }
      ,
      slideNext()
      {
        this.$broadcast('slideNext')
      }
      ,
      slidePre()
      {
        this.$broadcast('slidePre')
      }
    },
    components: {
      slide
    }
  }
</script>

<style>

  .index-nav {
    display: flex;
  }

  .nav-bit {
    flex: auto;
    text-align: center;
    height: 50px;
    background-color: #ddd;
  }

  .xxnr-title {
    position: relative;
    padding: 0 2%;
    height: 30px;
    line-height: 30px;
    font-size: 15px;
  }

  .title-more {
    position: absolute;
    right: 2%;
    font-size: 12px;
    line-height: 12px;
    bottom: 5px;
  }

  .container {
    padding: 0 2%;
  }

  .product-item {
    width: 48%;
    float: left;
    margin-left: 4%;
    height: 130px;
    background-color: #00CC99;
    margin-bottom: 8px;
  }

  .product-item:nth-child(2n +1 ) {
    margin-left: 0;
  }

  .footer {
    color: #999;
    text-align: center;
    font-size: 12px;
    padding: 15px 0 8px;
  }

  .footer-tel {
    font-size: 12px;
    line-height: 40px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
  }

  .footer-company {

  }

  .footer-link {
    display: flex;
  }

  .footer-link a {
    display: inline-block;
    flex: auto;
    font-size: 15px;
    border-left: 1px solid #ccc;
  }

  .footer-link a:first-child {
    border-left: none;
  }

  #slider {
    max-width: 600px;
    text-align: center;
    margin: 0 auto;
  }

  #overflow {
    width: 100%;
    overflow: hidden;
  }

  #slides .inner {
    width: 400%;
  }

  #slides .inner {
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -o-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);

    -webkit-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -moz-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -o-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -ms-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
    transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000);

    -webkit-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -moz-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -o-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
    -ms-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
    transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
  }

  #slides article {
    width: 25%;
    float: left;
  }

  #slide1:checked ~ #slides .inner {
    margin-left: 0;
  }

  #slide2:checked ~ #slides .inner {
    margin-left: -100%;
  }

  #slide3:checked ~ #slides .inner {
    margin-left: -200%;
  }

  #slide4:checked ~ #slides .inner {
    margin-left: -300%;
  }

  input[type="radio"] {
    display: none;
  }

  label {
    background: #CCC;
    display: inline-block;
    cursor: pointer;
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }

  #slide1:checked ~ label[for="slide1"],
  #slide2:checked ~ label[for="slide2"],
  #slide3:checked ~ label[for="slide3"],
  #slide4:checked ~ label[for="slide4"] {
    background: #333;
  }


</style>
