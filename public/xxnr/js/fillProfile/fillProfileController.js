/**
 * Created by xxnr-cd on 15/12/21.
 */
var app = angular.module('fillProfile', ['xxnr_common','shop_cart']);
app.controller('fillProfileController', function($scope, remoteApiService, commonService, $http){
    var sweetalert = commonService.sweetalert;

    $scope.provinces = [{name:"省份",id: 0}];
    $scope.profileProvince = $scope.provinces[0];
    $scope.cities = [{name:"城市",id: 0}];
    $scope.profileCity = $scope.cities[0];
    $scope.counties = [{name:"区县",id: 0}];
    $scope.profileCounty = $scope.counties[0];
    $scope.towns = [{name:"乡镇",id: 0}];
    $scope.profileTown = $scope.towns[0];

    //$scope.identities = [{name:"选择类型",id:0}];
    $scope.identities = [];
    //$scope.selectedIdentity = $scope.identities[0];
    $scope.sex = 'male';

    $scope.testClick = function(){
        console.log('test');
    };


    var getProvinceList = function(provinceId,cityId,countyId,townId){
        var userHasProvince = false;
        remoteApiService.getProvinceList()
            .then(function(data) {
                for (var index in data.datas.rows) {
                    var province = {};
                    province.name = data.datas.rows[index].name;
                    province.id = data.datas.rows[index].id;
                    $scope.provinces.push(province);
                    if(provinceId){
                        if (province.id == provinceId) {
                            $scope.profileProvince = province;
                            userHasProvince = true;
                        }
                    }
                }
                if(!userHasProvince){
                    $scope.profileProvince = $scope.provinces[0];
                }else if(userHasProvince && cityId){
                    $scope.getCityList(cityId,countyId,townId);
                }

            });

    };
    $scope.getCityList = function(cityId,countyId,townId) {
        var userHasCity = false;
        remoteApiService.getCityList($scope.profileProvince.id)
            .then(function (data) {
                $scope.cities = [];
                for (var index in data.datas.rows) {
                    var city = {};
                    city = angular.copy(data.datas.rows[index]);
                    $scope.cities.push(city);
                    if(cityId){
                        if (city.id == cityId) {
                            $scope.profileCity = city;
                            userHasCity = true;
                        }
                    }
                }
                if(!userHasCity){
                    $scope.profileCity = $scope.cities[0];
                    $scope.getCountyList();
                }else if(userHasCity && cityId){
                    $scope.getCountyList(countyId,townId);
                }

            })
    };
    $scope.getCountyList = function(countyId,townId) {
        var userHasCounty = false;
        remoteApiService.getCountyList($scope.profileCity.id)
            .then(function (data) {
                $scope.counties = [];
                for (var index in data.datas.rows) {
                    var county = {};
                    county = angular.copy(data.datas.rows[index]);
                    $scope.counties.push(county);
                    if(countyId){
                        if (county.id == countyId) {
                            $scope.profileCounty = county;
                            userHasCounty = true;
                        }
                    }
                }
                if(!userHasCounty){
                    $scope.profileCounty = $scope.counties[0];
                    $scope.getTownList();
                }else if(userHasCounty && countyId){
                    $scope.getTownList(townId);
                }

            })
    };
    $scope.getTownList = function(townId) {
        var userHasTown = false;
        remoteApiService.getTownList($scope.profileCity.id,$scope.profileCounty?$scope.profileCounty.id:'')
            .then(function (data) {
                $scope.towns = [];
                for (var index in data.datas.rows) {
                    var town = {};
                    town = angular.copy(data.datas.rows[index]);
                    $scope.towns.push(town);
                    if(townId){
                        if (town.id == townId) {
                            $scope.profileTown = town;
                            userHasTown = true;
                        }
                    }

                }
                if(!userHasTown){
                    $scope.profileTown = $scope.towns[0];
                }

            })
    };

    var getUserInfo = function(){
        remoteApiService.userTypeList()
            .then(function(data) {
                for (var index in data.data) {
                    $scope.identities.push({id:index,name:data.data[index]});
                    //console.log($scope.identities);
                }

                remoteApiService.getBasicUserInfo()
                    .then(function(data){
                        //if(data.datas.isUserInfoFullFilled){
                        //    window.location.href = '/';
                        //}
                        $scope.userName = data.datas.name;
                        $scope.sex = data.datas.sex?'female':'male';
                        for(var i in $scope.identities){
                            if($scope.identities[i].id == data.datas.userType){
                                $scope.selectedIdentity = $scope.identities[i];
                            }
                        }
                        if(data.datas.isUserInfoFullFilled){
                            getProvinceList(data.datas.address.province.id,data.datas.address.city.id,data.datas.address.county?data.datas.address.county.id:'',data.datas.address.town?data.datas.address.town.id:'');
                        }else{
                            getProvinceList();
                        }
                    });
            });

    };
    getUserInfo();




    $scope.modifyProfile = function(){
        if($scope.userName.gblen()>12){
            sweetalert('姓名限6个汉字或12个英文字符');
        }else {
            if($scope.profileProvince.id!=0 && $scope.profileCity.id!=0 && $scope.userName) {
                var req = {
                    method: 'POST',
                    url: 'api/v2.0/user/modify',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "userName": $scope.userName,
                        "type": $scope.selectedIdentity.id,
                        "sex": $scope.sex == 'male' ? 'false' : 'true',
                        //"sex":$scope.sex=='male'?0:1,
                        "address": {
                            provinceId: $scope.profileProvince.id,
                            cityId: $scope.profileCity.id,
                            countyId: $scope.profileCounty ? $scope.profileCounty.id : '',
                            townId: $scope.profileTown ? $scope.profileTown.id : ''
                        }
                    }
                };
                $http(req).then(function successCallback(response) {
                    if (response.data.code == 1000) {

                        sweetalert('个人资料保存成功','my_xxnr.html');
                    }
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('Error');
                });
            }else{
                    sweetalert('请填写完整信息');
                }
        }
    };
    $scope.skip = function() {
        window.location.href = '/my_xxnr.html';
    };
    $scope.$watch('profileProvince', function(newValue, oldValue) { 
        if (newValue === oldValue) { return; } 
        console.log(oldValue); 
        if(oldValue.id == 0){
            $scope.provinces.shift();
            $scope.cities.shift();
            $scope.counties.shift();
            $scope.towns.shift();
        }

    });
    String.prototype.gblen = function() {
        var len = 0;
        for (var i=0; i<this.length; i++) {
            if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {
                len += 2;
            } else {
                len ++;
            }
        }
        return len;
    }
});
