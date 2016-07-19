import {
  GET_PRODUCTDETAIL,
  SHOW_ATTRBOX,
  HIDE_ATTRBOX,
  TAB_PRODUCTDETAIL,
  CHANGE_PRODUCTNUMBER,
  SELECT_SKU,
  SELECT_ADDITION,
  IS_ALLSKUSSELECTED,
  QUERY_SKUS,
  BUY_PRODUCT,
  CLEAR_PRODUCTDETAIL,
  IS_FROMORDER
  } from '../mutation-types'

const state= {
  product: {},
  attrBoxDisplay: false,
  tabIndex: 0,
  productNumber: 1,
  selectedAdditions: [],
  selectedSKUs: [],
  isAllSKUSelected: false,
  SKUList: [],
  AdditionList: [],
  attrBoxType: 0,
  isFromOrder: false,
  isNull: true
}

const mutations = {
  [GET_PRODUCTDETAIL] (state, product) {
    state.product = product;
    state.isNull = false;
    state.SKUList = [];
    state.AdditionList = [];
    document.getElementsByTagName('body')[0].scrollTop = 0;
  },
  [SHOW_ATTRBOX] (state, type) {
    state.attrBoxType = type;
    state.SKUList = [];
    state.AdditionList = [];
    state.attrBoxDisplay = true;
    for(let i = 0; i < state.product.SKUAttributes.length; i++){
      //if(state.product.SKUAttributes.hasOwnProperty(i)){
        var _flag = false;
        for(let j = 0; j < state.product.SKUAttributes[i].isSelected.length; j++){
          if(state.product.SKUAttributes[i].isSelected[j]==true){
            state.SKUList.push(state.product.SKUAttributes[i].values[j]);
            _flag = true;
          }
        }
        if(_flag==false){
          //alert('请选中一个SKU');
          return;
        }
      //}
    }
    state.isAllSKUSelected = true;
  },
  [HIDE_ATTRBOX] (state) {
    state.attrBoxDisplay = false;
  },
  [TAB_PRODUCTDETAIL] (state, index) {
    state.tabIndex = index;
  },
  [CHANGE_PRODUCTNUMBER] (state, type) {
    if(type == 1 && state.productNumber < 9999) {
      state.productNumber++;
    } else if(type == -1 && state.productNumber > 1){
      state.productNumber--;
    } else {
      return;
    }
  },
  [SELECT_SKU] (state, parentIndex, index) {
    if(state.product.SKUAttributes[parentIndex].selectable[index]){
      var temp = state.product.SKUAttributes[parentIndex].isSelected[index];
      for(var i in state.product.SKUAttributes[parentIndex].isSelected){
        state.product.SKUAttributes[parentIndex].isSelected[i] = false;
      }
      state.selectedSKUs = [];
      state.product.SKUAttributes[parentIndex].isSelected.$set(index,!temp);
      for(var i in state.product.SKUAttributes){
        for(var j in state.product.SKUAttributes[i].isSelected){
          if(state.product.SKUAttributes[i].isSelected[j] == true){
            state.selectedSKUs.push({name:state.product.SKUAttributes[i].name,value:state.product.SKUAttributes[i].values[j]});
          }
        }
      }
    }
  },
  [QUERY_SKUS] (state, SKUs) {
    state.product.SKU_id = '';
    state.SKUList = [];
    if(SKUs.SKU){
      state.product.SKU_id = SKUs.SKU._id;
      state.isAllSKUSelected = true;
    } else {
      state.isAllSKUSelected = false;
    }
    if(SKUs.price){
      state.product.minPrice = SKUs.price.min;
      state.product.maxPrice = SKUs.price.max;
    }
    if(SKUs.market_price && SKUs.market_price.max && SKUs.market_price.min){
      state.product.marketPriceDisplay = true;
      state.product.marketMinPrice = SKUs.market_price.min;
      state.product.marketMaxPrice = SKUs.market_price.max;
    }else{
      state.product.marketPriceDisplay = false;
      state.product.marketMinPrice = 0;
      state.product.marketMaxPrice = 0;
    }
    for(var i in SKUs.attributes){
      for(var j in state.product.SKUAttributes){
        if(SKUs.attributes[i].name == state.product.SKUAttributes[j].name){
          for(var k in state.product.SKUAttributes[j].values){
            if(SKUs.attributes[i].values.indexOf(state.product.SKUAttributes[j].values[k]) == -1){
              state.product.SKUAttributes[j].selectable.$set(k, false);
            }else{
              state.product.SKUAttributes[j].selectable.$set(k, true);
            }
          }
        }
      }
    }
    if(SKUs.additions){
      state.product.SKUAdditions = SKUs.additions;
      for(var i in state.product.SKUAdditions){
        state.product.SKUAdditions[i].isSelected = false;
      }
    }

    for(let i = 0; i < state.product.SKUAttributes.length; i++){
      for(let j = 0; j < state.product.SKUAttributes[i].isSelected.length; j++){
        if(state.product.SKUAttributes[i].isSelected[j] == true){
          state.SKUList.push(state.product.SKUAttributes[i].values[j]);
        }
      }
    }
  },
  [SELECT_ADDITION] (state, index) {
    state.selectedAdditions = [];
    if(state.product.SKUAdditions[index].isSelected){
      state.product.minPrice = (Number(state.product.minPrice) - Number(state.product.SKUAdditions[index].price)).toFixed(2);
      state.product.maxPrice = (Number(state.product.maxPrice) - Number(state.product.SKUAdditions[index].price)).toFixed(2);
    }else{
      state.product.minPrice = (Number(state.product.minPrice) + Number(state.product.SKUAdditions[index].price)).toFixed(2);
      state.product.maxPrice = (Number(state.product.maxPrice) + Number(state.product.SKUAdditions[index].price)).toFixed(2);
    }
    if(state.product.marketMinPrice != 0 && state.product.marketMaxPrice !=0){
      if(state.product.SKUAdditions[index].isSelected){
        state.product.marketMinPrice = (Number(state.product.marketMinPrice) - Number(state.product.SKUAdditions[index].price)).toFixed(2);
        state.product.marketMaxPrice = (Number(state.product.marketMaxPrice) - Number(state.product.SKUAdditions[index].price)).toFixed(2);
      }else{
        state.product.marketMinPrice = (Number(state.product.marketMinPrice) + Number(state.product.SKUAdditions[index].price)).toFixed(2);
        state.product.marketMaxPrice = (Number(state.product.marketMaxPrice) + Number(state.product.SKUAdditions[index].price)).toFixed(2);
      }
    }
    //state.product.SKUAdditions[index].$set(isSelected, !state.product.SKUAdditions[index].isSelected);
    state.product.SKUAdditions.$set(index,{
      ref: state.product.SKUAdditions[index].ref,
      name: state.product.SKUAdditions[index].name,
      price: state.product.SKUAdditions[index].price,
      isSelected: !state.product.SKUAdditions[index].isSelected
    });
    state.AdditionList = [];
    for(let i = 0; i < state.product.SKUAdditions.length; i++){
      if(state.product.SKUAdditions[i].isSelected == true){
        state.selectedAdditions.push(state.product.SKUAdditions[i].ref);
        if(state.isAllSKUSelected == true){
          state.AdditionList.push(state.product.SKUAdditions[i].name);
        } else {
          state.AdditionList = [];
        }
      }
    }
  },
  [CLEAR_PRODUCTDETAIL] (state) {
    state.product = {};
    state.productNumber = 1;
    state.selectedAdditions = [];
    state.isAllSKUSelected = false;
    state.isNull = true;
    state.tabIndex = 0;
  },
  [IS_FROMORDER] (state, value) {
    state.isFromOrder = value;
  }
}

export default {
  state,
  mutations
}


