<template>
  <div class="section-tabs">
    <div v-for="category in categories">
      {{category}}
    </div>
  </div>
</template>

<script>
  export default {
    vuex: {
      getters: {
        categories: function (state) {
          return state.sectionTabs.categories
        }
      },
      actions: {
      }
    }
  }
</script>

<style>

</style>
