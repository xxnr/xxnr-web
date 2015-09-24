/**
 * Created by pepelu on 9/15/2015.
 */
var app = angular.module('xxnr');
app.controller('jiesuanController', function($scope, remoteApiService, payService){
    $scope.contacts = [];
    $scope.showModifyPop = false;
    $scope.showAddPop = false;
    $scope.showPop = false;
    $scope.showYunfeiPop=false;
    $scope.modifyAddress = {province:{}, city:{}, country:{}, isDefault:false};
    $scope.cities = [];
    remoteApiService.getAddressList()
        .then(function(data){
            var addressList = data.datas.rows;
            $scope.addressId = addressList[0].addressId;
            for( var i in addressList){
                var contact = {};
                contact.name = addressList[i].receiptPeople;
                contact.addressId = addressList[i].addressId;
                contact.address = addressList[i].address;
                contact.phone = addressList[i].receiptPhone;
                contact.province = addressList[i].areaName;
                contact.selected = addressList[i].type == 1;

                if(contact.selected == true){
                    $scope.selectedAddressId = contact.addressId;
                }

                $scope.contacts.push(contact);
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
        $scope.getProvinceList();
        $scope.modifyAddress.addressId = $scope.contacts[index].addressId;
    };

    $scope.addNewAddress = function(){
        $scope.showPop = true;
        $scope.showAddPop = true;
        $scope.getProvinceList();
    };
    $scope.getProvinceList = function(){
        remoteApiService.getProvinceList()
            .then(function(data){
                $scope.provinces = [];
                for(var index in data.datas.rows){
                    var province = {};
                    province.name = data.datas.rows[index].name;
                    province.id = data.datas.rows[index].id;

                    if(province.name=='河南'){
                        $scope.modifyAddress.province = province;
                    }
                    $scope.provinces.push(province);
                }
                $scope.getCityList();
            })
    };
    $scope.getCityList = function(){
        remoteApiService.getCityList($scope.modifyAddress.province.id)
            .then(function(data){
                $scope.cities.length=0;
                for(var index in data.datas.rows){
                    var city = {};
                    city = angular.copy(data.datas.rows[index]);
                    $scope.cities.push(city);

                    if(index == 0 ){
                        $scope.modifyAddress.city = city;
                    }
                }
                $scope.getCountryList();
            })
    };
    $scope.getCountryList = function(){
        remoteApiService.getCountryList($scope.modifyAddress.city.id)
            .then(function(data){
                $scope.countries = [];
                for(var index in data.datas.rows){
                    var country = {};
                    country = angular.copy(data.datas.rows[index]);
                    $scope.countries.push(country);
                    if(index==0){
                        $scope.modifyAddress.country = country;
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
		var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.country==null?'':$scope.modifyAddress.country.name) + $scope.modifyAddress.detailAddress;
        remoteApiService.saveUserAddress(type, $scope.modifyAddress.phone, $scope.modifyAddress.receiptName,
                detailAddress, $scope.modifyAddress.province.id)
            .then(function(data){
                if(data.code=="1000"){
                    alert("添加地址成功");
                    window.location.href='jiesuan.html';
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
		var detailAddress = $scope.modifyAddress.city.name + ($scope.modifyAddress.country==null?'':$scope.modifyAddress.country.name) + $scope.modifyAddress.detailAddress;
        remoteApiService.updateUserAddress($scope.modifyAddress.addressId, $scope.modifyAddress.province.id, detailAddress,
            $scope.modifyAddress.phone, $scope.modifyAddress.receiptName, type)
            .then(function(data){
                if(data.code=="1000"){
                    alert("修改地址成功");
                    window.location.href='jiesuan.html';
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
                    window.location.href='jiesuan.html';
                }
            })
    };
    $scope.finishPay = function(){
        window.location.href='userCenter.html';
    };
    $scope.notFinishPay = function(){
        window.location.href='userCenter.html';
    }
});