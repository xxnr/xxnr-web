<template>
  <div class="section-tabs clearfix">

      <div class="section-tab" v-for="category in categories" v-if="$index < 2">
        <a @click="showBackBtn()" v-link="{ path: '/'+ category.id}">
        {{category.name}}专场
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

<style>
  .section-tabs div{
    float: left;
  }
  .section-tab{
    height: 50px;
    width: 50%;
  }
</style>
