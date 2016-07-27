import Vue from 'vue'
Vue.filter('reverse', function (value) {
  return value.split('').reverse().join('')
})

Vue.filter('truncateStr', function (value, strLength) {
  return value.length > strLength ? (value.substr(0, strLength - 3) + '...') : value;
})

