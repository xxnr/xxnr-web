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
