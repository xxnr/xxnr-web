import api from '../api/remoteHttpApi'
import * as types from './mutation-types'
import {getCookie,removeCookie} from '../utils/authService'
let jsencrypt = require('../jsencrypt')
export const getCategories = ({dispatch,state}) => {
  api.getCategories(response => {
    dispatch(types.GET_CATEGORIES,response.data.categories)
  }, response => {
    //console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}
export const getIndexCars = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'6C7D8F66',page:1,max:4},
    response => {
      dispatch(types.GET_INDEXCARS,response.data.products)
    }, response => {
      //console.log(response);
      //dispatch(types.GET_CATEGORIES)
    })
}
export const getIndexHeafei = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'531680A5',page:1,max:4},
    response => {
    dispatch(types.GET_INDEXHUAFEI,response.data.products)
  }, response => {
    //console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const getCarsRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'6C7D8F66',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWCARS,response.data.datas.rows)
  }, response => {
    //console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
}

export const getHuafeiRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'531680A5',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWHUAFEI,response.data.datas.rows)
}, response => {
    //console.log(response);
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
  dispatch(types.RESET_TOASTMSG);
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
        //console.log(this.$route);
        window.location.href = '/';
      }else{
        console.log(response);
        dispatch(types.SET_TOASTMSG,response.data.message);
      }
    })
  }, response => {
    //console.log(response);
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
    //console.log(response);
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
    //console.log(response);
    //dispatch(types.GET_CATEGORIES)
  })
  dispatch(types.LOG_OUT);
}

export const getProductDetail = ({dispatch,state}, id) => {
  api.getProductDetail(
    {goodsId: id},
    response => {
    var productDetail = response.data;
    //data format
    productDetail.onSale = (productDetail.unitPrice === null || productDetail.unitPrice === '')? false:productDetail.unitPrice!=productDetail.originalPrice;
    for(var i in productDetail.SKUAdditions){
      productDetail.SKUAdditions[i].isSelected = false;
    }
    productDetail.minPrice = productDetail.SKUPrice ? productDetail.SKUPrice.min:0;
    productDetail.maxPrice = productDetail.SKUPrice?productDetail.SKUPrice.max:0;
    if(productDetail.SKUMarketPrice && productDetail.SKUMarketPrice.max && productDetail.SKUMarketPrice.min){
      productDetail.marketPriceDisplay = true;
      productDetail.marketMinPrice = productDetail.SKUMarketPrice.min;
      productDetail.marketMaxPrice = productDetail.SKUMarketPrice.max;
    }else{
      productDetail.marketPriceDisplay = false;
      productDetail.marketMinPrice = 0;
      productDetail.marketMaxPrice = 0;
    }

    for(var i in productDetail.SKUAttributes){
      if(productDetail.SKUAttributes.hasOwnProperty(i)){
        productDetail.SKUAttributes[i].isSelected = [];
        productDetail.SKUAttributes[i].selectable = [];
        if(productDetail.SKUAttributes[i].values.length==1){
          productDetail.SKUAttributes[i].isSelected.push(true);
          productDetail.SKUAttributes[i].selectable.push(true);

        }else{
          for(var j in productDetail.SKUAttributes[i].values){
            productDetail.SKUAttributes[i].isSelected.push(false);
            productDetail.SKUAttributes[i].selectable.push(true);
          };
        }
      }
    }

    if(productDetail.deposit){
      productDetail.buyActionName = '立即付定金';
    }else{
      productDetail.buyActionName = '立即购买';
    }

    //console.log(productDetail);

    // is all sku item selected
    for(let i = 0; i < productDetail.SKUAttributes.length; i++){
        if(productDetail.SKUAttributes.hasOwnProperty(i)){
          var _flag = false;
          for(let j = 0; j < productDetail.SKUAttributes[i].isSelected.length; j++){
            if(productDetail.SKUAttributes[i].isSelected[j]==true){
              _flag = true;
            }
          }
          if(_flag==false){
            //state.productDetail.isAllSKUSelected = false;
            console.log('请选中一个SKU');
            //return false;
          }
        }
    }
    //state.productDetail.isAllSKUSelected = true;
    // all sku item selected
    // get skuId
    var selectedSKUs = [];
    for(var i in productDetail.SKUAttributes){
      for(var j in productDetail.SKUAttributes[i].isSelected){
        if(productDetail.SKUAttributes[i].isSelected[j] == true){
          selectedSKUs.push({name:productDetail.SKUAttributes[i].name,value:productDetail.SKUAttributes[i].values[j]});
        }
      }
    }
    api.querySKUs(
      {attributes: selectedSKUs,
        product: productDetail._id
      },
      response => {
      if(response.data.data.SKU){
        productDetail.SKU_id = response.data.data.SKU._id;
        //state.productDetail.isAllSKUSelected = true;
      } else {
        //state.productDetail.isAllSKUSelected = false;
      }

      dispatch(types.GET_PRODUCTDETAIL, productDetail);
    }, response => {
      //console.log(response);
    })
  },response => {
   // console.log(response);
  })
}

export const getSliderImages = ({dispatch, state}) => {

  api.getSliderImages(
    response => {
    dispatch(types.GET_SLIDERIMAGES, response.data.datas.rows)
    }, response => {
      //console.log(response);
    })
}

export const sendRegisterCode = ({dispatch, state},phoneNum) => {
  dispatch(types.RESET_TOASTMSG);
  api.sendRegisterCode(
    {tel:phoneNum,bizcode:'register'},
    response => {
      dispatch(types.SET_TOASTMSG,response.data.message);
  }, response => {
    //console.log(response);
  })
}


export const register = ({dispatch,state},phoneNumber,password,registerCode) => {
  api.getPublicKey(response => {
    var public_key = response.data.public_key;
    var encrypt = new jsencrypt.default.JSEncryptExports.JSEncrypt();
    encrypt.setPublicKey(public_key);
    var encrypted = encrypt.encrypt(password);
    //console.log(encrypted)
    api.register(
      {account:phoneNumber, password:encrypted, smsCode:registerCode}
      ,response => {
      if (response.data.code == 1000) {
      //sessionStorage.setItem('user', JSON.stringify(response.data.datas));
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

export const bindInviter = ({dispatch,state},inviterPhone) => {
  let userId = state.auth.user.userid;
  api.bindInviter(
    {'userId':userId,'inviter':inviterPhone},
    response => {
      if (response.data.code == 1000) {
      //sessionStorage.setItem('user', JSON.stringify(response.data.datas));
      window.location.href = '/';
      }else{
        //TODO

      }
    }, response => {
      console.log(response);
      //dispatch(types.GET_CATEGORIES)
  })
}
export const showAttrBox = ({dispatch, state}) => {
  dispatch(types.SHOW_ATTRBOX);
}

export const hideAttrBox = ({dispatch, state}) => {
  dispatch(types.HIDE_ATTRBOX);
}

export const productDetailTab = ({dispatch, state}, index) => {
  dispatch(types.TAB_PRODUCTDETAIL, index);
}

export const changeProductNumber = ({dispatch, state}, type) => {
  dispatch(types.CHANGE_PRODUCTNUMBER, type)
}

export const selectSKU = ({dispatch, state}, parentIndex, index) => {
  dispatch(types.SELECT_SKU, parentIndex, index);
  api.querySKUs(
    {attributes: state.productDetail.selectedSKUs,
      product: state.productDetail.product._id
    },
    response => {
      dispatch(types.QUERY_SKUS, response.data.data)
  }, response => {
    //console.log(response);
  })
}

export const selectAddition = ({dispatch, state}, index) => {
  dispatch(types.SELECT_ADDITION, index);
}

export const buyProduct = ({dispatch, state}) => {
  if(state.productDetail){
    for(var i in state.productDetail.SKUAttributes){
      if(state.productDetail.SKUAttributes.hasOwnProperty(i)){
        var _flag = false;
        for(var j in state.productDetail.SKUAttributes[i].isSelected){
          if(state.productDetail.SKUAttributes[i].isSelected[j]==true){
            _flag = true;
          }
        }
        if(_flag==false){
          alert('请选中一个SKU');
          return;
        }
      }
    }
    if(state.productDetail.product.SKU_id) {
      api.addToCart({
        SKUId: state.productDetail.product.SKU_id,
        additions: state.productDetail.selectedAdditions,
        count: state.productDetail.productNumber,
        update_by_add: true
      },
      response => {
        if(response.data.code != 1000) {
          alert(response.data.message);
          return;
        }
        window.location.href = '/#!/order?id=' + state.productDetail.product.SKU_id + '&count='+ state.productDetail.productNumber;
      }, response=> {
        console.log('error');
      })
    } else {
      alert('请选择一个SKU');
      return;
    }

    //return true;
  }
}

export const getRSCListByProduct = ({dispatch, state}, id) => {
  api.getRSCListByProduct({
    products: id
  }, response => {
    dispatch(types.GET_RSCLISTBYPRODUCT, response.data.RSCs);
  }, response => {
    console.log('error');
  })
}

export const selectRSC = ({dispatch, state}, index) => {
  dispatch(types.SELECT_RSC, index);
}

export const RSCConfirm = ({dispatch, state}, index) => {
  dispatch(types.CONFIRM_RSC, index);
}

export const getShoppingCart = ({dispatch, state}) => {
  api.getShoppingCart(response => {
    console.log(response);
    dispatch(types.GET_SHOPPINGCART, response.data.datas.rows);
  },
  response=> {
    console.log(response);
  })
}

