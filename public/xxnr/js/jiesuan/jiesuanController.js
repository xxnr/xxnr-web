/**
 * Created by pepelu on 9/15/2015.
 */
var app = angular.module('jiesuan', ['xxnr_common', 'shop_cart']);
app.controller('jiesuanController', function ($scope, remoteApiService, payService, commonService, loginService) {

    var sweetalert = commonService.sweetalert;

    var productsQuery = "";
    /////////////////////////////////////

    $scope.consigneeName; //用来保存准备提交的自提收货人姓名
    $scope.consigneePhone; //用来保存准备提交的自提收货人电话
    $scope.undefinedAddressMsg = "";
    $scope.contacts = [];  //收货人地址列表
    $scope.showModifyPop = false;
    $scope.showAddPop = false;
    $scope.showPop = false;
    $scope.showYunfeiPop = false;
    $scope.showSelectCompanyPop = false;
    $scope.showConsigneePop = false;
    $scope.newConsigneeCommit = false;     //判断是否是新加网点自提的收货人
    $scope.modifyAddress = {province: {}, city: {}, county: {}, street: {}, isDefault: false};
    $scope.cities = [];
    $scope.hasCompany = false;
    $scope.delivery = [];
    $scope.companySelected = false;
    $scope.moreContactDisplay = false;
    $scope.selectedCompanyId = -1;
    $scope.selectingCompanyId =-1;
    $scope.selectedConsigneeNum = -1;

    $scope.selectedAddressIndex = 0;
    $scope.everClickOneOfMoreContacts = false;
    $scope.isOverflow = false;
    $scope.cityListCompanies = [{
        name: "全部地区",
        id: 0
    }];
    $scope.cityCompanys = $scope.cityListCompanies[0];
    $scope.countyListCompanies = [{
        name: "全部地区",
        id: 0
    }];
    $scope.selectOfCountyCompanies = $scope.countyListCompanies[0];

    remoteApiService.getAddressList()
        .then(function (data) {
            var addressList = data.datas.rows;
            $scope.addressId = addressList.length ? addressList[0].addressId : null;
            for (var i in addressList) {
                if(addressList.hasOwnProperty(i)){
                    var contact = {};
                    contact.name = addressList[i].receiptPeople;
                    contact.addressId = addressList[i].addressId;
                    contact.detailAddress = addressList[i].address;
                    contact.address = addressList[i].areaName + ' ' + addressList[i].cityName + ' ' + (addressList[i].countyName || '') + ' ' + (addressList[i].townName || '') + ' ' + addressList[i].address;
                    contact.phone = addressList[i].receiptPhone;
                    contact.province = addressList[i].areaName;
                    contact.selected = addressList[i].type == 1;
                    contact.areaId = addressList[i].areaId;
                    contact.cityId = addressList[i].cityId;
                    contact.countyId = addressList[i].countyId;
                    contact.townId = addressList[i].townId;
                    contact.isDefault = addressList[i].type == 1;
                    contact.zipCode = addressList[i].zipCode;

                    if (contact.selected == true) {
                        $scope.selectedAddressId = contact.addressId;
                    }

                    $scope.contacts.push(contact);
                }

            }

            if ($scope.contacts.length == 0) {
                $scope.hasConsigneeAddress = false;
            } else {
                $scope.hasConsigneeAddress = true;
                if (!$scope.selectedAddressId) {
                    $scope.selectedAddressId = $scope.contacts[0].addressId;
                    $scope.contacts[0].selected = true;
                }
            }
        });


    $scope.hideModifyPop = function () {
        $scope.showPop = false;
        $scope.showModifyPop = false;
        $scope.isOverflow = false;

    };
    $scope.hideAddPop = function () {
        $scope.showPop = false;
        $scope.showAddPop = false;
        $scope.isOverflow = false;
    };
    $scope.editAddress = function (index) {
        $scope.showPop = true;
        $scope.showModifyPop = true;
        $scope.isOverflow = true;
        $scope.getProvinceList($scope.contacts[index].areaId, $scope.contacts[index].cityId, $scope.contacts[index].countyId, $scope.contacts[index].townId);
        $scope.modifyAddress.detailAddress = $scope.contacts[index].detailAddress;
        $scope.modifyAddress.receiptName = $scope.contacts[index].name;
        $scope.modifyAddress.phone = $scope.contacts[index].phone;
        $scope.modifyAddress.addressId = $scope.contacts[index].addressId;
        $scope.modifyAddress.isDefault = $scope.contacts[index].isDefault?1:0;
        $scope.modifyAddress.zipCode = $scope.contacts[index].zipCode;
    };

    $scope.addNewAddress = function () {
        $scope.modifyAddress.detailAddress = undefined;
        $scope.modifyAddress.zipCode = undefined;
        $scope.modifyAddress.receiptName = undefined;
        $scope.modifyAddress.phone = undefined;
        $scope.showPop = true;
        $scope.showAddPop = true;
        $scope.isOverflow = true;

        //$scope.getProvinceList();
    };

    $scope.getProvinceList = function (areaId, cityId, countyId, townId) {
        $scope.modifyAddress.province = null;
        remoteApiService.getProvinceList()
            .then(function (data) {
                $scope.provinces = [];
                for (var index in data.datas.rows) {
                    if(data.datas.rows.hasOwnProperty(index)){
                        var province = {};
                        province.name = data.datas.rows[index].name;
                        province.id = data.datas.rows[index].id;

                        if (areaId) {
                            if (province.id == areaId) {
                                $scope.modifyAddress.province = province;
                            }
                        } else {
                            if (province.name == '河南') {
                                $scope.modifyAddress.province = province;
                            }
                        }
                        $scope.provinces.push(province);
                    }
                }
                $scope.getCityList(cityId, countyId, townId);
            })
    };
    $scope.getCityList = function (cityId, countyId, townId) {
        $scope.modifyAddress.city = null;
        remoteApiService.getCityList($scope.modifyAddress.province.id)
            .then(function (data) {
                $scope.cities.length = 0;
                for (var index in data.datas.rows) {
                    if(data.datas.rows.hasOwnProperty(index)){
                        var city = {};
                        city = angular.copy(data.datas.rows[index]);
                        $scope.cities.push(city);

                        if (cityId) {
                            if (city.id == cityId) {
                                $scope.modifyAddress.city = city;
                            }
                        } else {
                            if (index == 0) {
                                $scope.modifyAddress.city = city;
                            }
                        }
                    }

                }
                $scope.getCountyList(countyId, townId);
            })
    };
    $scope.getCountyList = function (countyId, townId) {
        $scope.modifyAddress.county = null;
        remoteApiService.getCountyList($scope.modifyAddress.city.id)
            .then(function (data) {

                $scope.counties = [];
                for (var index in data.datas.rows) {
                    if(data.datas.rows.hasOwnProperty(index)){
                        var county = {};
                        county = angular.copy(data.datas.rows[index]);
                        $scope.counties.push(county);
                        if (countyId && $scope.counties.length > 0) {
                            if (county.id == countyId) {
                                $scope.modifyAddress.county = county;
                            }
                        } else {
                            if (index == 0) {
                                $scope.modifyAddress.county = county;
                            }
                        }
                    }

                }
                $scope.getTownList(townId);

            })
    };
    $scope.getTownList = function (townId) {
        $scope.modifyAddress.town = null;
        remoteApiService.getTownList($scope.modifyAddress.city.id, $scope.modifyAddress.county ? $scope.modifyAddress.county.id : '')
            .then(function (data) {
                $scope.towns = [];
                for (var index in data.datas.rows) {
                    if(data.datas.rows.hasOwnProperty(index)){
                        var town = {};
                        town = angular.copy(data.datas.rows[index]);
                        $scope.towns.push(town);
                        if (townId) {
                            if (town.id == townId) {
                                $scope.modifyAddress.town = town;
                            }
                        } else {
                            if (index == 0) {
                                $scope.modifyAddress.town = town;
                            }
                        }
                    }
                }
            })

    };
    $scope.submitAddressAdd = function () {
        if (!$scope.modifyAddress.detailAddress) {
            sweetalert("请填写详细地址");
            return;
        }
        if (!$scope.modifyAddress.receiptName) {
            sweetalert("请填写收件人姓名");
            return;
        }
        if (!$scope.modifyAddress.phone) {
            sweetalert("请填写电话");
            return;
        }
        if (!/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test($scope.modifyAddress.phone)) {
            sweetalert("请填写正确的电话");
            return;
        }
        var type = $scope.modifyAddress.isDefault ? 1 : 0;
//        var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.county==null?'':$scope.modifyAddress.county.name) + $scope.modifyAddress.detailAddress;
        var detailAddress = $scope.modifyAddress.detailAddress;
        remoteApiService.saveUserAddress(type, $scope.modifyAddress.phone, $scope.modifyAddress.receiptName,
            detailAddress, $scope.modifyAddress.province.id, $scope.modifyAddress.city.id, $scope.modifyAddress.county ? $scope.modifyAddress.county.id : '', $scope.modifyAddress.town.id, $scope.modifyAddress.zipCode)
            .then(function (data) {
                if (data.code == "1000") {
                    $scope.hideAddPop();
                    sweetalert("添加地址成功");
                    if(!$scope.contacts || $scope.contacts === null || $scope.contacts === undefined || $scope.contacts.length === 0){
                        $scope.hasConsigneeAddress = true;
                    }
                    else {
                        if($scope.modifyAddress.isDefault){
                            for(var i in $scope.contacts) {
                                $scope.contacts[i].isDefault = false;
                            }
                        }
                        for(var j in $scope.contacts) {
                            $scope.contacts[j].selected = false;
                        }
                    }

                    var newContact = {
                        name:$scope.modifyAddress.receiptName,
                        phone:$scope.modifyAddress.phone,
                        isDefault:$scope.modifyAddress.isDefault,
                        selected:true,
                        areaId:$scope.modifyAddress.province.id,
                        cityId:$scope.modifyAddress.city.id,
                        countyId:$scope.modifyAddress.county.id || null,
                        townId:$scope.modifyAddress.town.id || null,
                        detailAddress:$scope.modifyAddress.detailAddress,
                        address:$scope.modifyAddress.province.name + ' ' + $scope.modifyAddress.city.name + ' ' + ($scope.modifyAddress.county.name || '') + ' ' + ($scope.modifyAddress.town.name || '') + ' ' + $scope.modifyAddress.detailAddress,
                        zipCode:$scope.modifyAddress.zipCode,
                        addressId:data.datas.addressId
                    };
                    $scope.contacts.unshift(newContact);
                    $scope.selectedAddressIndex = 0;
                    $scope.selectedAddressId = $scope.contacts[$scope.selectedAddressIndex].addressId;


                    $scope.modifyAddress.detailAddress = undefined;
                    $scope.modifyAddress.zipCode = undefined;
                    $scope.modifyAddress.receiptName = undefined;
                    $scope.modifyAddress.phone = undefined;
                }
            })
    };
    $scope.deliveryMethodClick = function(index){
        $scope.deliveryMethod = $scope.deliveries[index].deliveryType;
    };
    $scope.submitAddressEdit = function () {
        if (!$scope.modifyAddress.detailAddress) {
            sweetalert("请填写详细地址");
            return;
        }
        if (!$scope.modifyAddress.receiptName) {
            sweetalert("请填写收件人姓名");
            return;
        }
        if (!$scope.modifyAddress.phone) {
            sweetalert("请填写电话");
            return;
        }
        if (!/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test($scope.modifyAddress.phone)) {
            sweetalert("请填写正确的电话");
            return;
        }
        var type = $scope.modifyAddress.isDefault ? 1 : 0;
//      var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.county==null?'':$scope.modifyAddress.county.name) + $scope.modifyAddress.detailAddress;
        var detailAddress = $scope.modifyAddress.detailAddress;
        remoteApiService.updateUserAddress($scope.modifyAddress.addressId, $scope.modifyAddress.province.id, detailAddress,
            $scope.modifyAddress.phone, $scope.modifyAddress.receiptName, type, $scope.modifyAddress.city.id, $scope.modifyAddress.county ? $scope.modifyAddress.county.id : '', $scope.modifyAddress.town.id, $scope.modifyAddress.zipCode)
            .then(function (data) {
                if (data.code == "1000") {
                    $scope.hideModifyPop();
                    sweetalert("修改地址成功");
                    updateWebpageAddressData($scope.modifyAddress.addressId);
                    $scope.modifyAddress.detailAddress = undefined;
                    $scope.modifyAddress.zipCode = undefined;
                    $scope.modifyAddress.receiptName = undefined;
                    $scope.modifyAddress.phone = undefined;
                }
            })
    };
    $scope.selectAddress = function (index) {
        if(index>2){
            $scope.everClickOneOfMoreContacts = true;
        }
        for (var i in $scope.contacts) {
            $scope.contacts[i].selected = false;
        }
        $scope.contacts[index].selected = true;
        $scope.selectedAddressIndex = index;
        $scope.selectedAddressId = $scope.contacts[index].addressId;
    };
    $scope.enterAddress = function (index) {
        $scope.hoveredAddressNumber = index;
    };
    $scope.leaveAddress = function () {
        $scope.hoveredAddressNumber = -1;
    };

    $scope.deleteAddress = function (index) {
        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i) == "8.") {
            var r = confirm("是否删除该地址？");
            if (r == true) {
                remoteApiService.deleteUserAddress($scope.contacts[index].addressId)
                    .then(function (data) {
                        if (data.code == "1000") {
                            sweetalert("删除成功");
                            if($scope.contacts.length === 1 ){
                                $scope.hasConsigneeAddress = false;
                                $scope.selectedAddressId = null;
                                $scope.selectedAddressIndex = null;
                                $scope.contacts.splice(index, 1);
                            }else{
                                if($scope.contacts[index].selected){
                                    $scope.contacts.splice(index, 1);
                                    $scope.selectedAddressIndex = 0;
                                    $scope.contacts[0].selected = true;
                                    $scope.selectedAddressId = $scope.contacts[0].addressId;
                                }else{
                                    $scope.contacts.splice(index, 1);
                                }
                            }
                        }else{
                            sweetalert(data.message);
                        }
                    });
            } else {
                return false;
            }
        } else {
            swal({
                    title: "是否删除该地址？",
                    //text: nominated_inviter.name + "   " + nominated_inviter.phone,
                    //type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: '#00913a',
                    confirmButtonText: '确定',
                    cancelButtonText: "取消",
                    closeOnConfirm: false
                },
                function (isConfirm) {
                    if (isConfirm) {
                        remoteApiService.deleteUserAddress($scope.contacts[index].addressId)
                            .then(function (data) {
                                if (data.code == "1000") {
                                    sweetalert("删除成功");
                                    if($scope.contacts.length === 1 ){
                                        $scope.hasConsigneeAddress = false;
                                        $scope.selectedAddressId = null;
                                        $scope.selectedAddressIndex = null;
                                        $scope.contacts.splice(index, 1);
                                    }else{
                                        if($scope.contacts[index].selected){
                                            $scope.contacts.splice(index, 1);
                                            $scope.selectedAddressIndex = 0;
                                            $scope.contacts[0].selected = true;
                                            $scope.selectedAddressId = $scope.contacts[0].addressId;
                                        }else{
                                            $scope.contacts.splice(index, 1);
                                        }
                                    }
                                }else{
                                    sweetalert(data.message);
                                }
                            });
                    }
                });
        }

    };
    $scope.selectCompany = function(index){
        //if(!$scope.selectedCompanyId){
        //    $scope.selectingCompanyId = -1;
        //}else{
        //    $scope.selectingCompanyId = $scope.selectedCompanyId;
        //}
        $scope.selectingCompanyId = $scope.RSCs[index]._id;
    };
    $scope.checkedCompany = function(){
        $scope.companySelected = true;
        $scope.showPop = false;
        $scope.showSelectCompanyPop = false;
        $scope.isOverflow = false;
        $scope.selectedCompanyId = $scope.selectingCompanyId;
        for(var i in $scope.RSCs){
            if($scope.RSCs.hasOwnProperty(i)){
                if($scope.RSCs[i]._id==$scope.selectedCompanyId){
                    $scope.selectedCompanyInfo = $scope.RSCs[i].RSCInfo;
                }
            }
        }
        $scope.selectingCompanyId = -1;
        //$scope.selectedCompanyInfo = $scope.RSCs[$scope.selectedCompanyNum].RSCInfo;
    };
    $scope.selectConsignee = function(index){
        $scope.selectedConsigneeNum = index;
    };
    $scope.showSelectCompany = function () {
        $scope.showSelectCompanyPop = true;
        $scope.isOverflow = true;

        $scope.showPop = true;
        productsQuery = combineProductsQuery();
        //$scope.selectedCompanyId = -1;
        remoteApiService.RSCAddressProvince(productsQuery)
            .then(function (data) {
                if (data.code == 1000) {
                    //根据产品获取RSC的省级地址
                    $scope.provinceListCompanies = data.provinceList;

                    //$scope.selectOfProvinceCompanies = $scope.provinceListCompanies[0];

                    //保存选过的网店信息
                    //if($scope.selectedCompanyInfo){
                    //    for(var i in $scope.provinceListCompanies){
                    //        if($scope.provinceListCompanies[i]._id == $scope.selectedCompanyInfo.companyAddress.province._id){
                    //            $scope.selectOfProvinceCompanies = $scope.provinceListCompanies[i];
                    //        }
                    //    }
                    //
                    //}else{
                    //    $scope.selectOfProvinceCompanies = $scope.provinceListCompanies[0];
                    //}

                    //查找是否有河南省
                    var hasHeNanProvince = function(){
                        var HeNanindex = -1;
                        for(var i in $scope.provinceListCompanies){
                            if($scope.provinceListCompanies[i].name == '河南'){
                                HeNanindex = i;
                            }
                        }
                        return HeNanindex;
                    };

                    //默认选择河南省
                    if(hasHeNanProvince()!=-1){
                        $scope.selectOfProvinceCompanies = $scope.provinceListCompanies[hasHeNanProvince()];
                    }else{
                        $scope.selectOfProvinceCompanies = $scope.provinceListCompanies[0];
                    }
                    $scope.getCityCompaniesList();
                    getRSC()
                }
            });
    };
    var combineProductsQuery = function (){
        var resultProductsQuery = "";
        //combine array elements to a query string
        for (var product_id in $scope.products_Ids) {
            if($scope.products_Ids.hasOwnProperty(product_id)){
                resultProductsQuery = resultProductsQuery + $scope.products_Ids[product_id] + ',';
            }

        }
        resultProductsQuery = resultProductsQuery.slice(0, -1);
        // ***************************************
        return resultProductsQuery;
    };
    var checkSelectedCompanyId = function(){  //如果列表中没有已选择的RSC就返回false,以便于自动置于第一个RSC
        var result = false;
        for(var i in $scope.RSCs){
            if($scope.RSCs[i]._id==$scope.selectedCompanyId){
                result = true;
            }
        }
        return result;
    };
    var updateWebpageAddressData = function(addressId){
        var upadatedIndex;  //被修改的地址的序号
        var defaultIndex;
        for(var i in $scope.contacts){
            if($scope.contacts.hasOwnProperty(i)){
                if($scope.contacts[i].isDefault){
                    defaultIndex = i;
                }
                if($scope.contacts[i].addressId == addressId){
                    upadatedIndex = i;
                    $scope.contacts[i].name = $scope.modifyAddress.receiptName;
                    $scope.contacts[i].phone = $scope.modifyAddress.phone;
                    $scope.contacts[i].areaId = $scope.modifyAddress.province.id;
                    $scope.contacts[i].cityId = $scope.modifyAddress.city.id;
                    $scope.contacts[i].countyId = $scope.modifyAddress.county.id || null;
                    $scope.contacts[i].townId = $scope.modifyAddress.town.id || null;
                    $scope.contacts[i].address = $scope.modifyAddress.province.name + ' ' + $scope.modifyAddress.city.name + ' ' + ($scope.modifyAddress.county.name || '') + ' ' + ($scope.modifyAddress.town.name || '') + ' ' + $scope.modifyAddress.detailAddress;
                    $scope.contacts[i].zipCode = $scope.modifyAddress.zipCode;
                    $scope.contacts[i].isDefault = $scope.modifyAddress.isDefault;
                }
            }

        }
        if(defaultIndex && defaultIndex!=upadatedIndex){
            if($scope.modifyAddress.isDefault){
                $scope.contacts[defaultIndex].isDefault = false;
            }
        }
        if ($scope.modifyAddress.isDefault) {
            $scope.contacts = $scope.contacts.splice(upadatedIndex,1).concat($scope.contacts);
        }
    };

    $scope.checkHasAvailableCompany = function(){
        productsQuery = combineProductsQuery();

        remoteApiService.RSCAddressProvince(productsQuery)
            .then(function (data) {
                if (data.code == 1000) {
                    if(data.provinceList.length>=1){
                        $scope.hasCompany = true;
                    }
                }
            });
    };
    $scope.getCityCompaniesList = function () {
        $scope.cityListCompanies = [{
            name: "全部地区",
            id: 0
        }];
        remoteApiService.RSCAddressCity(productsQuery, $scope.selectOfProvinceCompanies._id)
            .then(function (data) {
                for (var index in data.cityList) {
                    if(data.cityList.hasOwnProperty(index)){
                        var city = {};
                        city = angular.copy(data.cityList[index]);
                        $scope.cityListCompanies.push(city);
                    }
                }
                //保存选中的市
                //if($scope.selectedCompanyInfo){
                //    for(var i in $scope.cityListCompanies){
                //        if($scope.cityListCompanies[i]._id == $scope.selectedCompanyInfo.companyAddress.city._id){
                //            $scope.selectOfCityCompanies = $scope.cityListCompanies[i];
                //        }else{
                //            $scope.selectOfCityCompanies = $scope.cityListCompanies[i];
                //        }
                //    }
                //
                //}else{
                //    $scope.selectOfCityCompanies = $scope.cityListCompanies[0];
                //}
                $scope.selectOfCityCompanies = $scope.cityListCompanies[0];
                $scope.RSCs = [];
                $scope.getCountyCompaniesList();
            });

    };
    $scope.getCountyCompaniesList = function () {
        $scope.countyListCompanies = [{
            name: "全部地区",
            id: 0
        }];
        remoteApiService.RSCAddressCounty(productsQuery, $scope.selectOfProvinceCompanies._id, $scope.selectOfCityCompanies._id)
            .then(function (data) {
                for (var index in data.countyList) {
                    if(data.countyList.hasOwnProperty(index)){
                        var county = {};
                        county = angular.copy(data.countyList[index]);
                        $scope.countyListCompanies.push(county);
                    }
                }
                //保存选过的县区
                //if($scope.selectedCompanyInfo){
                //    for(var i in $scope.countyListCompanies){
                //        if($scope.countyListCompanies[i]._id == $scope.selectedCompanyInfo.companyAddress.county._id){
                //            $scope.selectOfCountyCompanies = $scope.countyListCompanies[i];
                //        }else{
                //            $scope.selectOfCountyCompanies = $scope.countyListCompanies[0];
                //        }
                //    }
                //
                //}else{
                //    $scope.selectOfCountyCompanies = $scope.countyListCompanies[0];
                //}
                $scope.selectOfCountyCompanies = $scope.countyListCompanies[0];
                $scope.RSCs = [];
                getRSC();
            });

    };
    $scope.checkSelectingCompanyInPopRSCList = function () {
        if($scope.RSCs){
            var result = false;
            for(var i=0;i<$scope.RSCs.length;i++){
                //console.log($scope.RSCs[i]._id == $scope.selectingCompanyId);
                if($scope.RSCs[i]._id == $scope.selectingCompanyId){
                    result = true;
                }
            }
            return result;
        }

    };
    $scope.getRSCwithAllAddress = function(){
        $scope.RSCs = [];
        getRSC();
    };

    var getRSC = function () {
        remoteApiService.getRSC(
            productsQuery,
            $scope.selectOfProvinceCompanies ? $scope.selectOfProvinceCompanies._id : null,
            $scope.selectOfCityCompanies && $scope.selectOfCityCompanies._id != 0 ? $scope.selectOfCityCompanies._id : null,
            $scope.selectOfCountyCompanies && $scope.selectOfCountyCompanies._id != 0 ? $scope.selectOfCountyCompanies._id : null
            )
            .then(function (data) {
                if (data.code == 1000) {
                    $scope.RSCs = data.RSCs;
                    //for(var i in $scope.RSCs){
                    //    if($scope.RSCs[i]._id == $scope.selectedCompanyId){
                    //        $scope.selectingCompanyId = $scope.RSCs[i]._id;
                    //    }
                    //}

                }
            });
    };
    $scope.showEditConsigneePop = function () {
        $scope.selectedConsigneeNum = -1;
        $scope.showConsigneePop = true;
        $scope.showPop = true;
        $scope.isOverflow = true;

        $scope.popConsigneeName = "";
        $scope.popConsigneePhone = "";
        remoteApiService.queryConsignees()
            .then(function (data) {
                if(data.datas.rows){
                    $scope.oldConsignees = data.datas.rows;
                }else{
                    $scope.hasOldConsignees = false;
                }
            });
    };
    remoteApiService.queryConsignees()
        .then(function (data) {
            if(data.code==1000){
                if(data.datas.rows && data.datas.total>0){
                    $scope.oldConsignees = data.datas.rows;
                    $scope.hasOldConsignees = true;
                    $scope.consigneeName = $scope.oldConsignees[0].consigneeName;
                    $scope.consigneePhone = $scope.oldConsignees[0].consigneePhone;
                }else{
                    $scope.hasOldConsignees = false;
                }
                if(!$scope.hasOldConsignees){
                    remoteApiService.getBasicUserInfo()
                        .then(function(data) {
                            $scope.newConsigneePhone = data.datas.phone;
                            $scope.newConsigneeName = data.datas.name;
                        });

                }
            }else{
                sweetalert("获取历史收货人失败,请重试", window.location.href);
            }
        });
    $scope.focusShowValidate = function(formGroupNum) {
        $scope.focusFormGroupNum = formGroupNum;
    };
    $scope.blurShowValidate = function() {
        $scope.focusFormGroupNum = 0;
    };
    $scope.saveConsignee = function(){
        $scope.newConsigneeCommit = true;
        remoteApiService.saveConsignees($scope.newConsigneeName, $scope.newConsigneePhone)
            .then(function (data) {
                if(data.code==1000){
                    //console.log('保存收货人成功');
                    $scope.consigneeName = $scope.newConsigneeName;
                    $scope.consigneePhone = $scope.newConsigneePhone;
                }else{
                    sweetalert("保存收货人失败,请重试", window.location.href);
                }
            });
    };
    $scope.consigneeSelected = function(){
        $scope.showPop = false;
        $scope.showConsigneePop=false;
        $scope.isOverflow = false;

        if($scope.selectedConsigneeNum!=-1){
            $scope.consigneeName = $scope.oldConsignees[$scope.selectedConsigneeNum].consigneeName;
            $scope.consigneePhone = $scope.oldConsignees[$scope.selectedConsigneeNum].consigneePhone;
        }
    };
    $scope.popSaveConsignee = function(){
        $scope.newConsigneeCommit = true;
        var newConsignee = {consigneeName:$scope.popConsigneeName,consigneePhone:$scope.popConsigneePhone};
        var newConsigneeExsit = false;
        $scope.oldConsignees.forEach(function(oldConsignee) {
            if(oldConsignee.consigneeName == newConsignee.consigneeName && oldConsignee.consigneePhone == newConsignee.consigneePhone){
                newConsigneeExsit = true;
            }
        });
        if(newConsigneeExsit){
            $scope.consigneeName = newConsignee.consigneeName;
            $scope.consigneePhone = newConsignee.consigneePhone;
            $scope.showPop = false;
            $scope.showConsigneePop=false;
            $scope.isOverflow = false;
            //console.log('保存收货人成功');
            $scope.popNewConsigneeForm.name.$dirty = false;
        }else{
            remoteApiService.saveConsignees($scope.popConsigneeName, $scope.popConsigneePhone)
                .then(function (data) {
                    if(data.code==1000){
                        $scope.oldConsignees.unshift(newConsignee);
                        $scope.consigneeName = $scope.oldConsignees[0].consigneeName;
                        $scope.consigneePhone = $scope.oldConsignees[0].consigneePhone;
                        $scope.showPop = false;
                        $scope.showConsigneePop=false;
                        $scope.isOverflow = false;
                        $scope.popNewConsigneeForm.name.$dirty = false;
                        //console.log('保存收货人成功');
                    }else{
                        sweetalert("保存收货人失败,请重试", window.location.href);
                    }
                });
        }
    };

    $scope.getProvinceList();
});
app.directive('under12', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(modelValue) {
                if (modelValue.gblen() <= 12) {
                    // it is valid
                    ctrl.$setValidity('under12', true);
                    return modelValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('under12', false);
                    return undefined;
                }
            });
        }
    };
});

var PHONE_REGEXP = /*/^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/*/ /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
app.directive('phoneverfied', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (PHONE_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('phoneverfied', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('phoneverfied', false);
                    return undefined;
                }
            });
        }
    };
});
