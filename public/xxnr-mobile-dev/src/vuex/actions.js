import api from '../api/remoteHttpApi'
import * as types from './mutation-types'
import {getCookie,removeCookie} from '../utils/authService'
import {getUrlParam, checkPath, getStringLen} from '../utils/common'
let jsencrypt = require('../jsencrypt')

export const getCategories = ({dispatch,state}) => {
  api.getCategories(response => {
    dispatch(types.GET_CATEGORIES,response.data.categories)
  }, response => {
  })
}
export const getIndexCars = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'6C7D8F66',page:1,max:6},
    response => {
      dispatch(types.GET_INDEXCARS,response.data.products)
    }, response => {
    })
}
export const getIndexHeafei = ({dispatch,state}) => {
  api.getIndexProducts(
    {category:'531680A5',page:1,max:6},
    response => {
    dispatch(types.GET_INDEXHUAFEI,response.data.products)
  }, response => {
  })
}

export const getCarsRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'6C7D8F66',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWCARS,response.data.datas)
  }, response => {
  })
}

export const getHuafeiRowsViewCars = ({dispatch,state}) => {
  api.getProductsListPage(
    {classId:'531680A5',page:1,rowCount:20},
    response => {
    dispatch(types.GET_ROWSVIEWHUAFEI,response.data.datas)
}, response => {
  })
}

export const showBackBtn = ({dispatch,state}) => {
  dispatch(types.SHOW_BACKBUTTON)
}
export const hideBackBtn = ({dispatch,state}) => {
  dispatch(types.HIDE_BACKBUTTON)
}

export const editTitle = ({dispatch, state}, title) => {
  dispatch(types.EDIT_TITLE, title);
}

export const hideRightBtn = ({dispatch,state}) => {
  dispatch(types.HIDE_RIGHTBUTTON)
}
export const showRightBtn = ({dispatch,state}) => {
  dispatch(types.SHOW_RIGHTBUTTON)
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

export const setRightButtonText = ({dispatch, state}, data, path) => {
  dispatch(types.SET_RIGHTBUTTONTEXT, data, path);
}

export const goBack = ({dispatch,state}) => {
  if(getUrlParam('redirect')) {
    window.location.href = decodeURIComponent(getUrlParam('redirect'));
    return;
  }
  if(window.location.pathname.indexOf('my_orders')!=-1){
    //window.location.href = '#!/my_xxnr';  //对我的订单页面有个特殊的路由处理,在任何一个标签都跳会我的新新农人
    router.go('/my_xxnr')
  }else if(window.location.pathname.indexOf('my_xxnr')!=-1){
    //window.location.href = '#!/home';
    router.go('/home')
  }else if(window.location.pathname.indexOf('login')!=-1){
    //window.location.href = '#!/home';
    router.go('/my_xxnr')
    //window.history.back();
  }else if(window.location.pathname == '/order') {
    if(state.order.cartList.goodsId) {
      router.go('/productDetail?id='+ state.order.cartList.goodsId);
    } else {
      window.history.back();
    }
  } else if (window.location.pathname.indexOf('productDetail')!=-1){
    if(state.productDetail.isFromOrder) {
      router.go('/home');
      return;
    }
    window.history.back();
  } else if(window.location.pathname.indexOf('commitPay')!=-1 && window.location.search.indexOf('fromOrder') != -1) {
      if(state.order.orderInfo.rows.orderGoodsList[0].goodsId) {
        router.go('/productDetail?id='+ state.order.orderInfo.rows.orderGoodsList[0].goodsId);
        return;
      }
  }else {
    window.history.back();
  }
}

export const login = ({dispatch,state},PhoneNumber,password) => {
  dispatch(types.RESET_TOASTMSG);
  if(!PhoneNumber){
    dispatch(types.SET_TOASTMSG, '请输入手机号');
    return;
  }
  var reg = /^1\d{10}$/;
  if(!reg.test(PhoneNumber)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }
  if(!password){
    dispatch(types.SET_TOASTMSG, '请输入密码');
    return;
  }

  api.getPublicKey(response => {
    var public_key = response.data.public_key;
    var encrypt = new jsencrypt.default.JSEncryptExports.JSEncrypt();
    encrypt.setPublicKey(public_key);
    var encrypted = encrypt.encrypt(password);
    api.login(
      {account:PhoneNumber, password:encrypted, keepLogin:true}
      ,response => {
      if (response.data.code == 1000) {
        sessionStorage.setItem('user', JSON.stringify(response.data.datas));
        //router.go('/home');
        if(getUrlParam('ref')) {
          router.go(decodeURIComponent(getUrlParam('ref')));
          return;
        }
        if(getUrlParam('redirect')) {
          window.location.href = decodeURIComponent(getUrlParam('redirect'));
          return;
        }
        router.go('/home');
      }else{
        dispatch(types.SET_TOASTMSG,response.data.message);
      }
    })
  }, response => {
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
  })
}

export const logout = ({dispatch,state}) => {
  removeCookie('__user');
  removeCookie('__scart');
  removeCookie('token');
  dispatch(types.LOG_OUT);
}

export const getOrders = ({dispatch,state},typeValue,pageNum,changedTab) => {
  api.getOrdersList(
    {'typeValue':typeValue,'page':pageNum},
    response => {
    if(pageNum<=response.data.pages){
      dispatch(types.GET_ORDERS_LIST,response.data.items,changedTab);
    }

  }, response => {
  })
  dispatch(types.LOG_OUT);
}

export const getProductDetail = ({dispatch,state}, id) => {
  api.getProductDetail(
    {productId: id},
    response => {
    var productDetail = response.data.datas;
    //data format
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
            //console.log('请选中一个SKU');
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
    })
  },response => {
  })
}

export const clearProductDetail = ({dispatch, state}) => {
  dispatch(types.CLEAR_PRODUCTDETAIL);
}

export const getSliderImages = ({dispatch, state}) => {
  api.getSliderImages(
    response => {
    dispatch(types.GET_SLIDERIMAGES, response.data.datas.rows)
    }, response => {
    })
}

export const register = ({dispatch,state},phoneNumber,password,registerCode,confirmPassword,policyChecked) => {
  dispatch(types.RESET_TOASTMSG);
  if(!phoneNumber){
    dispatch(types.SET_TOASTMSG, '请输入手机号');
    return;
  }
  var reg = /^1\d{10}$/;
  if(!reg.test(phoneNumber)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }
  if(!registerCode){
    dispatch(types.SET_TOASTMSG, '请输入验证码');
    return;
  }
  if(!password){
    dispatch(types.SET_TOASTMSG, '请输入密码');
    return;
  }
  if(!confirmPassword){
    dispatch(types.SET_TOASTMSG, '请输入确认密码');
    return;
  }
  if(password.length < 6){
    dispatch(types.SET_TOASTMSG, '密码需不小于6位');
    return;
  }

  if(password != confirmPassword) {
    dispatch(types.SET_TOASTMSG, '两次密码不一致，请重新输入');
    return;
  }

  if(!policyChecked) {
    dispatch(types.SET_TOASTMSG, '请同意网站使用协议');
    return;
  }

  api.getPublicKey(response => {
    var public_key = response.data.public_key;
    var encrypt = new jsencrypt.default.JSEncryptExports.JSEncrypt();
    encrypt.setPublicKey(public_key);
    var encrypted = encrypt.encrypt(password);
    api.register(
      {account:phoneNumber, password:encrypted, smsCode:registerCode}
      ,response => {
      if (response.data.code == 1000) {
      //sessionStorage.setItem('user', JSON.stringify(response.data.datas));
        dispatch(types.SET_TOASTMSG, '注册成功');
        if(getUrlParam('ref')) {
          router.go(decodeURIComponent(getUrlParam('ref')));
          return;
        }
        if(getUrlParam('redirect')) {
          window.location.href = decodeURIComponent(getUrlParam('redirect'));
          return;
        }
        router.go('/home');
      }else{
        dispatch(types.SET_TOASTMSG, response.data.message);
        return;
      }
    })
  }, response => {
  })
}

export const bindInviter = ({dispatch,state},inviterPhone) => {
  dispatch(types.RESET_TOASTMSG);
  var reg = /^1\d{10}$/;
  if(inviterPhone == '') {
    dispatch(types.SET_TOASTMSG, '请输入手机号');
    return;
  }
  if(!reg.test(inviterPhone)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }
  let userId = state.auth.user.userid;
  let loginName = state.auth.userInfo.loginName;
  if(inviterPhone == loginName) {
    dispatch(types.SET_TOASTMSG, '不能绑定自己为新农代表，请重新输入');
    return;
  }
  api.bindInviter(
    {'userId':userId,'inviter':inviterPhone},
    response => {
      if(response.data.code == 1001) {
        dispatch(types.SET_TOASTMSG, '该手机号未注册，请重新输入');
        return;
      }
      if (response.data.code == 1000) {
      //sessionStorage.setItem('user', JSON.stringify(response.data.datas));
        router.go('/home');
      }else{
        //TODO

      }
    }, response => {
  })
}
export const showAttrBox = ({dispatch, state}, type) => {
  dispatch(types.SHOW_ATTRBOX, type);
}

export const hideAttrBox = ({dispatch, state}) => {
  dispatch(types.HIDE_ATTRBOX);
}

export const showPopBox = ({dispatch, state}) => {
  dispatch(types.SHOW_POPBOX);
}

export const hidePopBox = ({dispatch, state}) => {
  dispatch(types.HIDE_POPBOX);
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
  })
}

export const selectAddition = ({dispatch, state}, index) => {
  dispatch(types.SELECT_ADDITION, index);
}

export const buyProduct = ({dispatch, state}) => {
  if(!state.productDetail.isAllSKUSelected) {
    dispatch(types.SET_TOASTMSG,'请选中一个SKU');
    return;
  }
  dispatch(types.RESET_TOASTMSG);
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
          //alert('请选中一个SKU');
          dispatch(types.SET_TOASTMSG,'请选中一个SKU');
          return;
        }
      }
    }
    dispatch(types.HIDE_ATTRBOX);
    if(state.productDetail.product.SKU_id) {
      api.addToCart({
        SKUId: state.productDetail.product.SKU_id,
        additions: state.productDetail.selectedAdditions,
        count: state.productDetail.productNumber,
        update_by_add: true
      },
      response => {
        if(response.data.code != 1000) {
          if(response.data.code == 1401) {
            router.go('/login');
          } else {
            dispatch(types.SET_TOASTMSG,response.data.message);
            dispatch(types.HIDE_ATTRBOX);
            return;
          }
        }
        router.go('/order?id=' + state.productDetail.product.SKU_id + '&count='+ state.productDetail.productNumber + '&productId=' + state.productDetail.product._id);
      }, response=> {
      })
    } else {
      dispatch(types.SET_TOASTMSG,'请选中一个SKU');
      //alert('请选择一个SKU');
      return;
    }

    //return true;
  }
}

export const getRSCListByProduct = ({dispatch, state}, id) => {
  dispatch(types.RESET_TOASTMSG);
  api.getRSCListByProduct({
    products: id
  }, response => {
    if(response.data.code == 1000) {
      dispatch(types.GET_RSCLISTBYPRODUCT, response.data.RSCs);
      return;
    }
    if(response.data.code == 1401) {
      router.go('/login');
      return;
    }
    dispatch(types.SET_TOASTMSG, response.data.message);
  }, response => {
  })
}

export const selectRSC = ({dispatch, state}, index) => {
  dispatch(types.SELECT_RSC, index);
}

export const RSCConfirm = ({dispatch, state}) => {
  dispatch(types.RESET_TOASTMSG);
  var RSCNum = -1;
  for(let i = 0; i < state.order.RSCSelected.length; i++) {
    if(state.order.RSCSelected[i]) {
      RSCNum = i;
      break;
    }
  }
  if(RSCNum == -1) {
    dispatch(types.SET_TOASTMSG,'请选择自提网点');
    return;
  }
  dispatch(types.CONFIRM_RSC, RSCNum);
}

export const getShoppingCart = ({dispatch, state}) => {
  dispatch(types.RESET_TOASTMSG);
  api.getShoppingCart(response => {
    if(response.data.code == 1401){
      router.go('/login');
      return;
    }
    if(response.data.code == 1000) {
      dispatch(types.GET_SHOPPINGCARTBYSKU, response.data.datas.rows, response.data.datas.shopCartId);
      return;
    }
    dispatch(types.SET_TOASTMSG, response.data.message);
  },
  response=> {
  })
}

export const loadNextPageOrders = ({dispatch,state},inviterPhone) => {
  let userId = state.auth.user.userid;
  api.bindInviter(
    {'userId':userId,'inviter':inviterPhone},
    response => {
    if (response.data.code == 1000) {
    //sessionStorage.setItem('user', JSON.stringify(response.data.datas));
      router.go('/home')
    }else{
      //TODO
	}
	},response=>{

  });
}

export const getConsigneeList = ({dispatch, state}) => {
  api.getConsignee(response=> {
    if(response.data.code == '1401') {
      router.go('/login');
      return;
    }
    dispatch(types.GET_CONSIGNEE, response.data.datas.rows);
  }, response=>{
  })
}

export const saveConsignee = ({dispatch, state}, consigneeName, consigneePhone) => {
  dispatch(types.RESET_TOASTMSG);
  var reg = /^1\d{10}$/;
  if(consigneeName == '') {
    dispatch(types.SET_TOASTMSG, '请输入收货人姓名');
    return;
  }
  if(consigneePhone == '') {
    dispatch(types.SET_TOASTMSG, '请输入联系方式');
    return;
  }
  if(getStringLen(consigneeName) > 12) {
    dispatch(types.SET_TOASTMSG, '收货人姓名限6个汉字或12个字符');
    return;
  }
  if(!reg.test(consigneePhone)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的联系方式');
    return;
  }
  api.saveConsignee({
    consigneeName: consigneeName,
    consigneePhone: consigneePhone
  },response => {
    dispatch(types.SAVE_CONSIGNEE, consigneePhone, consigneeName);
  },response => {
  });
}

export const selectConsignee = ({dispatch, state}, index) => {
  dispatch(types.SELECT_CONSIGNEE, index);
  dispatch(types.CONFIRM_CONSIGNEE, index);
}

export const confirmConsignee = ({dispatch, state}, index) => {
}

export const commitOrder = ({dispatch, state}) => {
  var sku = [];
  sku.push({_id: state.order.cartList._id, count: state.order.cartList.count});
  dispatch(types.RESET_TOASTMSG);
  var postData = {
    shopCartId: state.order.shopCartId,
    SKUs: sku,
    deliveryType: 1,
    RSCId: state.order.orderRSC._id,
    consigneePhone: state.order.orderConsignee.consigneePhone,
    consigneeName: state.order.orderConsignee.consigneeName
  };
  if(!postData.RSCId) {
    dispatch(types.SET_TOASTMSG, '请选择自提网点');
    return;
  }

  api.addOrder(postData,response => {
    if(response.data.code == 1000) {
      dispatch(types.COMMIT_ORDER, response.data);
    } else {
      dispatch(types.SET_TOASTMSG, response.data.message);
    }
  },response => {

  });
}

export const offlinePay = ({dispatch, state}, id, price) => {
  api.offlinePay({
      orderId: id,
      price: price
    },
    response => {
      if(response.data.code == 1000) {
        router.go('/orderDone?id=' + getUrlParam('id'));
      } else {
        alert(response.data.message);
      }
  }, response => {

  });
}

export const getOrderDetail = ({dispatch, state}) => {
  api.getOrderDetail({
    orderId: getUrlParam('id')
  },response => {
    dispatch(types.GET_ORDERDETAIL, response.data.datas);
  }, response => {

  });
}

export const selfDelivery = ({dispatch, state}) => {
  api.getDeliveryCode({
    orderId: getUrlParam('id')
  },response=>{
    if(response.data.code == 1000) {
      dispatch(types.SELF_DELIVERY, response.data.deliveryCode);
      api.getOrderDetail({
        orderId: getUrlParam('id')
      },response => {
        dispatch(types.GET_ORDERDETAIL, response.data.datas);
    }, response => {

    });
    } else {

    }
  }, response => {
      //dispatch(types.GET_CATEGORIES)
    })
}

export const confirmOrder = ({dispatch, state}) => {
  if(!state.myOrders.hasSKUSelected) {
    return;
  }
  var SKURefs =[];
  for(let i = 0; i < state.myOrders.checkedSKUList.length; i++) {
    if(state.myOrders.checkedSKUList[i]) {
      SKURefs.push(state.myOrders.orderSKUList.SKUList[i].ref);
    }
  }
  api.confirmOrder({
    orderId: state.myOrders.confirmOrderId,
    SKURefs: SKURefs
  },response=>{
    if(response.data.code == 1000) {
      dispatch(types.SHOW_SUCCESSTOAST);
      dispatch(types.HIDE_POPBOX);
      setTimeout("window.location.reload();dispatch(types.HIDE_SUCCESSTOAST);", 2000 );
    } else {
      dispatch(types.SHOW_FAILURETOAST);
      dispatch(types.HIDE_POPBOX);
      setTimeout("window.location.reload();dispatch(types.HIDE_FAILURETOAST);", 2000 );
    }
  },response=>{

  });
}

export const getOrderDetailById = ({dispatch, state}, id) => {
  api.getOrderDetail({
    orderId: id
    },response => {
    dispatch(types.CONFIRM_ORDERSKU, response.data.datas.rows);
    dispatch(types.SHOW_POPBOX, id);
  }, response => {

  });
}

export const selectConfirmProduct = ({dispatch, state}, index) => {
  dispatch(types.SELECT_ORDERSKU, index);
}

export const getInviter = ({dispatch, state},userId) => {
  dispatch(types.RESET_TOASTMSG);
  api.getUserInfo(
    {'userId':userId},
    response => {
    if(response.data.code == 1000) {
      dispatch(types.GET_USERINFO,response.data.datas);
      if(response.data.datas.inviter) {
        api.getInviter(response=>{
          if(response.code == 1000) {
            dispatch(types.GET_INVITERINFO, response.datas);
            return;
          }
          if(response.code == 1401) {
            router.go('/login');
            return;
          }
          dispatch(types.SET_TOASTMSG, response.data.message);
        },response=>{

        })
      }
      return;
    }
    if(response.data.code == 1401) {
      router.go('/login');
      return;
    }
    dispatch(types.SET_TOASTMSG, response.data.message);
  }, response => {

  })

}

export const resetOrderCondignee = ({dispatch, state}, fromUrl) => {
  if(!(checkPath(fromUrl, '/orderConsignee') == 1 || checkPath(fromUrl, '/orderRSC') == 1)) {
    dispatch(types.RESET_ORDERCONSIGNEE);
    api.getConsignee(response=> {
      if(response.data.datas.rows.length != 0) {
      dispatch(types.SELECT_CONSIGNEEAUTO, response.data.datas.rows);
    }
    }, response=>{
    })
  }
}

export const resetOrderRSC = ({dispatch, state}, fromUrl) => {
  if(!(checkPath(fromUrl, '/orderConsignee') == 1 || checkPath(fromUrl, '/orderRSC') == 1)) {
    dispatch(types.RESET_ORDERRSC);
  }
}

export const clearInviter = ({dispatch, state}) => {
  dispatch(types.CLEAR_INVITER);
}

export const isFromOrder = ({dispatch, state}, path) => {
  if(checkPath(path, '/huafei') == 1 || checkPath(path, '/cars') == 1) {
    dispatch(types.IS_FROMORDER, false);
    return;
  }
  dispatch(types.IS_FROMORDER, true);
}

export const sendRegisterCode = ({dispatch, state},phoneNum) => {
  dispatch(types.HIDE_CODETIPS);
  dispatch(types.RESET_TOASTMSG);
  if(!phoneNum) {
    dispatch(types.SET_TOASTMSG,'请输入手机号');
    return;
  }
  var reg = /^1\d{10}$/;
  if(!reg.test(phoneNum)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }

  var postData = {
    bizcode: 'register',
    tel: phoneNum
  };
  api.sendCode(postData, response => {
  if(response.data.code != '1000') { //error
    dispatch(types.SET_TOASTMSG, response.data.message);
    return;
  }

  if(response.data.captcha) {
    dispatch(types.SET_CODEIMG, response.data.captcha);
    dispatch(types.SHOW_CODEBOX);
  } else {
    dispatch(types.HIDE_CODEBOX);
    dispatch(types.SET_TOASTMSG, "验证码获取成功，请注意查收");
  }
}, response => {

});

}

export const verifyCaptcha = ({dispatch, state}, phoneNum, authCode) => {
  dispatch(types.HIDE_CODETIPS);
  dispatch(types.RESET_TOASTMSG);
  if(!phoneNum) {
    dispatch(types.SET_TOASTMSG,'请输入手机号');
    return;
  }
  var reg = /^1\d{10}$/;
  if(!reg.test(phoneNum)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }
  if(authCode == '') {
    dispatch(types.SET_CODETIPS, '请输入图形验证码 ');
    dispatch(types.SHOW_CODETIPS);
    return;
  }

  var postData = {
    bizcode: 'register',
    tel: phoneNum,
    authCode: authCode
  };
  api.sendCode(postData, response => {
  if(response.data.code != '1000') { //error
    dispatch(types.SET_CODETIPS, response.data.message);
    dispatch(types.SHOW_CODETIPS);
    return;
  }

  if(response.data.captcha) {
    if(response.data.message) {
      dispatch(types.SET_CODETIPS, response.data.message);
      dispatch(types.SHOW_CODETIPS);
    }
    dispatch(types.SET_CODEIMG, response.data.captcha);
  } else {
    dispatch(types.HIDE_CODEBOX);
    dispatch(types.SET_TOASTMSG, '验证码获取成功，请注意查收');
  }
}, response => {

});
}

export const refreshCode = ({dispatch, state},phoneNum) => {
  dispatch(types.HIDE_CODETIPS);
  dispatch(types.RESET_TOASTMSG);
  if(!phoneNum) {
    dispatch(types.SET_TOASTMSG,'请输入手机号');
    return;
  }
  var reg = /^1\d{10}$/;
  if(!reg.test(phoneNum)) {
    dispatch(types.SET_TOASTMSG, '请输入正确的手机号');
    return;
  }
  var time = new Date().getTime();
  var imgUrl = '/api/v2.3/captcha?bizcode=register' + '&tel=' + phoneNum + '&time=' + time;
  dispatch(types.SET_CODEIMG, imgUrl);
}

export const hideCodeBox = ({dispatch, state}) => {
  dispatch(types.HIDE_CODEBOX);
}

export const showCodeBox = ({dispatch, state}) => {
  dispatch(types.SHOW_CODEBOX);
}

export const getMyPoints = ({dispatch, state}, userId) => {
  dispatch(types.RESET_TOASTMSG);
  api.getUserInfo({
    userId: userId
  },response => {
    if(response.data.code == 1000) {
      dispatch(types.GET_USERINFO,response.data.datas);
      return;
    }

    if(response.data.code == 1401) {
      router.go('/login');
      return;
    }
    dispatch(types.SET_TOASTMSG, response.data.message);
  }, response=> {

  });
}

export const resetConfirmOrder = ({dispatch, state}) => {
  dispatch(types.RESET_CONFIRMORDER);
}
