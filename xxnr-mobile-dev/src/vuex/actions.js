import api from '../api/remoteHttpApi'
import * as types from './mutation-types'

export const getCategories = ({dispatch}) => {
  api.getCategories(response => {
    console.log(response);
    console.log('haha');
    dispatch(types.GET_CATEGORIES)
  }, response => {
    console.log(response);
    dispatch(types.GET_CATEGORIES)
  })
}
