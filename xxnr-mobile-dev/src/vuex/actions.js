import api from '../api/remoteHttpApi'
import * as types from './mutation-types'

export const getCategories = ({dispatch,state}) => {
  api.getCategories(response => {
    dispatch(types.GET_CATEGORIES,response.data.categories)
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}
export const getIndexCars = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'6C7D8F66',page:1,max:4},
    response => {
      dispatch(types.GET_INDEXCARS,response.data.products)
    }, response => {
      console.log(response);
      //dispatch(types.GET_CATEGORIES)
    })
}
