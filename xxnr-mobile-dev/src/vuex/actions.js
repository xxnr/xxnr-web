import api from '../api/remoteHttpApi'
import * as types from './mutation-types'
import {getCookie,removeCookie} from '../utils/authService'
let jsencrypt = require('../jsencrypt')

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
export const closeAppDownload = ({dispatch,state}) => {
  dispatch(types.CLOSE_APPDOWNLOAD)
}
export const changeRightBtnHome = ({dispatch,state}) => {
  dispatch(types.CHANGE_RIGHTBTN_HOME)
}
export const changeRightBtnPathHome = ({dispatch,state}) => {
  dispatch(types.CHANGE_RIGHTBTNPATH_HOME)
}
export const changeRightBtnPathMyxxnr = ({dispatch,state}) => {
  dispatch(types.CHANGE_RIGHTBTNPATH_MYXXNR)
}

export const changeRightBtnMyXXNR = ({dispatch,state}) => {
  dispatch(types.CHANGE_RIGHTBTN_XXNR)
}
export const goBack = ({dispatch,state}) => {
  window.history.back();
}

export const login = ({dispatch,state},PhoneNumber,password) => {
  api.getPublicKey(response => {
    var public_key = response.data.public_key;
    var encrypt = new jsencrypt.default.JSEncryptExports.JSEncrypt();
    encrypt.setPublicKey(public_key);
    var encrypted = encrypt.encrypt(password);
    //console.log(encrypted)
    api.login(
      {account:PhoneNumber, password:encrypted, keepLogin:true}
      ,response => {
      if (response.data.code == 1000) {
        sessionStorage.setItem('user', JSON.stringify(response.data.datas));
        window.location.href = '/';
      }else{
        //TODO

      }
    })
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const getCookieUser = ({dispatch,state}) => {
  const user = getCookie('__user');
  if(user){
    dispatch(types.GET_COOKIEUSER,user);
  }
}

export const getUserInfo = ({dispatch,state},userId) => {
  api.getUserInfo(
    {'userId':userId},
    response => {
    dispatch(types.GET_USERINFO,response.data.datas);
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const logout = ({dispatch,state}) => {
  removeCookie('__user');
  removeCookie('__scart');
  removeCookie('token');
  dispatch(types.LOG_OUT);
}

export const getOrders = ({dispatch,state},typeValue) => {
  api.getOrdersList(
    {'typeValue':typeValue},
    response => {
    dispatch(types.GET_ORDERS_LIST,response.data.items);
  }, response => {
    console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
  dispatch(types.LOG_OUT);
}
