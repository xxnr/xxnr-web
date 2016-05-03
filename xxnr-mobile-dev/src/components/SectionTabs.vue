<template>
  <div class="section-tabs">
    <div v-for="category in categories">
      {{category.name}}
    </div>
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

</style>
