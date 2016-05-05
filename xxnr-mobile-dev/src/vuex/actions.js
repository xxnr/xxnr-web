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
export const getIndexHeafei = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'531680A5',page:1,max:4},
    response => {
    dispatch(types.GET_INDEXHUAFEI,response.data.products)
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const getCarsRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'6C7D8F66',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWCARS,response.data.datas.rows)
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const getHuafeiRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'531680A5',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWHUAFEI,response.data.datas.rows)
}, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const showBackBtn = ({dispatch,state}) => {
  dispatch(types.SHOW_BACKBUTTON)
}
export const hideBackBtn = ({dispatch,state}) => {
  dispatch(types.HIDE_BACKBUTTON)
}
