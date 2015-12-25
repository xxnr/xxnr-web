/**
 * Created by pepelu on 9/15/2015.
 */
var app = angular.module('jiesuan', ['xxnr_common']);
app.controller('jiesuanController', function($scope, remoteApiService){
    $scope.contacts = [];
    $scope.showModifyPop = false;
    $scope.showAddPop = false;
    $scope.showPop = false;
    $scope.showYunfeiPop=false;
    $scope.modifyAddress = {province:{}, city:{}, county:{}, isDefault:false};
    $scope.cities = [];
    remoteApiService.getAddressList()
        .then(function(data){
            var addressList = data.datas.rows;
            $scope.addressId = addressList.length ? addressList[0].addressId : null;
            for( var i in addressList){
                var contact = {};
                contact.name = addressList[i].receiptPeople;
                contact.addressId = addressList[i].addressId;
                contact.detailAddress = addressList[i].address;
                contact.address = addressList[i].areaName + addressList[i].cityName + addressList[i].countyName + addressList[i].address;
                contact.phone = addressList[i].receiptPhone;
                contact.province = addressList[i].areaName;
                contact.selected = addressList[i].type == 1;
                contact.areaId = addressList[i].areaId;
                contact.cityId = addressList[i].cityId;
                contact.countyId = addressList[i].countyId;

                if(contact.selected == true){
                    $scope.selectedAddressId = contact.addressId;
                }

                $scope.contacts.push(contact);
            }
            if(!$scope.selectedAddressId){
                $scope.selectedAddressId = $scope.contacts[0].addressId;
                $scope.contacts[0].selected = true;
            }
        });
    $scope.hideModifyPop = function(){
        $scope.showPop = false;
        $scope.showModifyPop = false;
    };
    $scope.hideAddPop = function(){
        $scope.showPop = false;
        $scope.showAddPop = false;
    };
    $scope.editAddress = function(index){
        $scope.showPop = true;
        $scope.showModifyPop = true;
        $scope.getProvinceList($scope.contacts[index].areaId, $scope.contacts[index].cityId, $scope.contacts[index].countyId);
        $scope.modifyAddress.detailAddress = $scope.contacts[index].detailAddress;
        $scope.modifyAddress.receiptName = $scope.contacts[index].name;
        $scope.modifyAddress.phone = $scope.contacts[index].phone;
        $scope.modifyAddress.addressId = $scope.contacts[index].addressId;
    };

    $scope.addNewAddress = function(){
        $scope.showPop = true;
        $scope.showAddPop = true;
        $scope.getProvinceList();
    };
    $scope.getProvinceList = function(areaId, cityId, countyId){
        remoteApiService.getProvinceList()
            .then(function(data) {
                $scope.provinces = [];
                for (var index in data.datas.rows) {
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
                $scope.getCityList(cityId, countyId);
            })
    };
    $scope.getCityList = function(cityId, countyId) {
        remoteApiService.getCityList($scope.modifyAddress.province.id)
            .then(function (data) {
                $scope.cities.length = 0;
                for (var index in data.datas.rows) {
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
                $scope.getCountyList(countyId);
            })
    };
    $scope.getCountyList = function(countyId) {
        remoteApiService.getCountyList($scope.modifyAddress.city.id)
            .then(function (data) {
                $scope.counties = [];
                for (var index in data.datas.rows) {
                    var county = {};
                    county = angular.copy(data.datas.rows[index]);
                    $scope.counties.push(county);
                    if (countyId) {
                        if (county.id == countyId) {
                            $scope.modifyAddress.county = county;
                        }
                    } else {
                        if (index == 0) {
                            $scope.modifyAddress.county = county;
                        }
                    }
                }
            })
    };
    $scope.submitAddressAdd = function(){
        if(!$scope.modifyAddress.detailAddress){
            alert("请填写详细地址");
            return;
        }
        if(!$scope.modifyAddress.receiptName){
            alert("请填写收件人姓名");
            return;
        }
        if(!$scope.modifyAddress.phone){
            alert("请填写电话");
            return;
        }
        if( !/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test($scope.modifyAddress.phone)){
            alert("请填写正确的电话");
            return;
        }
        var type = $scope.modifyAddress.isDefault?1:0;
//        var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.county==null?'':$scope.modifyAddress.county.name) + $scope.modifyAddress.detailAddress;
        var detailAddress = $scope.modifyAddress.detailAddress;
        remoteApiService.saveUserAddress(type, $scope.modifyAddress.phone, $scope.modifyAddress.receiptName,
                detailAddress, $scope.modifyAddress.province.id, $scope.modifyAddress.city.id, $scope.modifyAddress.county?$scope.modifyAddress.county.id:'')
            .then(function(data){
                if(data.code=="1000"){
                    alert("添加地址成功");
                    window.location.href=window.location.href;
                }
            })
    };
    $scope.submitAddressEdit = function(){
        if(!$scope.modifyAddress.detailAddress){
            alert("请填写详细地址");
            return;
        }
        if(!$scope.modifyAddress.receiptName){
            alert("请填写收件人姓名");
            return;
        }
        if(!$scope.modifyAddress.phone){
            alert("请填写电话");
            return;
        }
        if( !/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test($scope.modifyAddress.phone)){
            alert("请填写正确的电话");
            return;
        }
        var type = $scope.modifyAddress.isDefault?1:0;
//      var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.county==null?'':$scope.modifyAddress.county.name) + $scope.modifyAddress.detailAddress;
        var detailAddress = $scope.modifyAddress.detailAddress;
        remoteApiService.updateUserAddress($scope.modifyAddress.addressId, $scope.modifyAddress.province.id, detailAddress,
            $scope.modifyAddress.phone, $scope.modifyAddress.receiptName, type, $scope.modifyAddress.city.id, $scope.modifyAddress.county?$scope.modifyAddress.county.id:'')
            .then(function(data){
                if(data.code=="1000"){
                    alert("修改地址成功");
                    window.location.href=window.location.href;
                }
            })
    };
    $scope.selectAddress = function(index){
        for(var i in $scope.contacts){
            $scope.contacts[i].selected = false;
        }
        $scope.contacts[index].selected = true;
        $scope.selectedAddressId = $scope.contacts[index].addressId;
    };
    $scope.deleteAddress = function(index){
        remoteApiService.deleteUserAddress($scope.contacts[index].addressId)
            .then(function(data){
                if(data.code=="1000"){
                    alert("删除成功");
                    window.location.href=window.location.href;
                }
            })
    };
    $scope.finishPay = function(){
        window.location.href='my_xxnr.html';
    };
    $scope.notFinishPay = function(){
        window.location.href='my_xxnr.html';
    };
    
//    2015.10.13 commited by CUIDI
    $scope.payMethods = ['pay1','pay2','pay3','pay4'];
    $scope.selectedIndex = 0;
    $scope.itemClicked = function ($index) {
        console.log($index);
        $scope.selectedIndex = $index;
    };
});