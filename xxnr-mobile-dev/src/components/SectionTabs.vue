<template>
  <div class="section-tabs clearfix">
    <a href="">
      <div class="section-tab" v-for="category in categories" v-if="$index < 2">
        {{category.name}}专场
      </div>
    </a>
  </div>
</template>

<script>
  import { getCategories } from '../vuex/actions'

  export default {
    vuex:{
      getters:{
        categories: state => state.sectionTabs.categories
      },
      actions:{
        getCategories
      }
    },
    created () {
      this.getCategories()
    }
  }
</script>

<style>
  .section-tabs div{
    float: left;
  }
  .section-tab{
    height: 50px;
    width: 50%;
  }
</style>
