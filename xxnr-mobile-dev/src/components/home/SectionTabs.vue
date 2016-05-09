<template>
  <div class="section-tabs clearfix">
      <div class="section-tab" v-for="category in categories" v-if="$index < 2">
        <a @click="showBackBtn()" v-link="{ path: '/'+ category.id}">
          <span v-bind:class="{ 'orange': category.name == '汽车', 'blue': category.name == '化肥' }">
              {{category.name}}专场
          </span>
        <img src="/assets/images/car.png" class="section-tab-icon" v-if="category.name == '汽车'"/>
        <img src="/assets/images/fertilizer.png" class="section-tab-icon" v-if="category.name == '化肥'"/>
        </a>
      </div>
  </div>
</template>

<script>
  import { getCategories,showBackBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        categories: state => state.sectionTabs.categories
      },
      actions:{
        getCategories,showBackBtn
      }
    },
    created () {
      this.getCategories()
    }
  }
</script>

<style scoped>
  .section-tab{
    height: 50px;
    width: 50%;
    float: left;
    line-height: 50px;
    border-bottom: 1px solid #c7c7c7;
    border-left: 1px solid #c7c7c7;
    box-sizing: border-box;
    position: relative;
  }

  .section-tab a {
    position: absolute;
    right: 30px;
  }

  .section-tab:first-child {
    border-left: none;
  }

  .section-tab-icon{
    width: 34px;
    vertical-align: middle;
    margin-left: 13px;
  }

  .blue {
    color: #66CCEE;
  }

  .orange {
    color: #FF8822;
  }

  .section-tab-title {
  }
</style>
