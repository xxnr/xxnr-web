/**
 * Created by xxnr-cd on 16/03/09.
 */
var app = angular.module('applyCountyVeri', ['xxnr_common', 'shop_cart']);
app.controller('applyCountyController', function($scope, remoteApiService, commonService) {
    $scope.focusFormGroupNum = 0;
    $scope.hasAppliedCounty = false;

    $scope.provinces = [{
        name: "省份",
        id: 0
    }];
    $scope.profileProvince = $scope.provinces[0];
    $scope.cities = [{
        name: "城市",
        id: 0
    }];
    $scope.profileCity = $scope.cities[0];
    $scope.counties = [{
        name: "区县",
        id: 0
    }];
    $scope.profileCounty = $scope.counties[0];
    $scope.towns = [{
        name: "乡镇",
        id: 0
    }];
    $scope.profileTown = $scope.towns[0];
    var sweetalert = commonService.sweetalert;
    $scope.focusShowValidate = function(formGroupNum) {
        $scope.focusFormGroupNum = formGroupNum;
    };
    $scope.blurShowValidate = function() {
        $scope.focusFormGroupNum = 0;
    };

    var getProvinceList = function(provinceId, cityId, countyId, townId) {
        var userHasProvince = false;
        remoteApiService.getProvinceList()
            .then(function(data) {
                for (var index in data.datas.rows) {
                    var province = {};
                    province.name = data.datas.rows[index].name;
                    province.id = data.datas.rows[index].id;
                    province._id = data.datas.rows[index]._id;
                    $scope.provinces.push(province);
                    if (provinceId) {
                        if (province.id == provinceId) {
                            $scope.profileProvince = province;
                            userHasProvince = true;
                        }
                    }
                }
                if (!userHasProvince) {
                    $scope.profileProvince = $scope.provinces[0];
                } else if (userHasProvince && cityId) {
                    $scope.getCityList(cityId, countyId, townId);
                }

            });

    };
    $scope.getCityList = function(cityId, countyId, townId) {
        var userHasCity = false;
        remoteApiService.getCityList($scope.profileProvince.id)
            .then(function(data) {
                $scope.cities = [];
                for (var index in data.datas.rows) {
                    var city = {};
                    city = angular.copy(data.datas.rows[index]);
                    $scope.cities.push(city);
                    if (cityId) {
                        if (city.id == cityId) {
                            $scope.profileCity = city;
                            userHasCity = true;
                        }
                    }
                }
                if (!userHasCity) {
                    $scope.profileCity = $scope.cities[0];
                    $scope.getCountyList();
                } else if (userHasCity && cityId) {
                    $scope.getCountyList(countyId, townId);
                }

            });
    };
    $scope.getCountyList = function(countyId, townId) {
        var userHasCounty = false;
        remoteApiService.getCountyList($scope.profileCity.id)
            .then(function(data) {
                $scope.counties = [];
                for (var index in data.datas.rows) {
                    var county = {};
                    county = angular.copy(data.datas.rows[index]);
                    $scope.counties.push(county);
                    if (countyId) {
                        if (county.id == countyId) {
                            $scope.profileCounty = county;
                            userHasCounty = true;
                        }
                    }
                }
                if (!userHasCounty) {
                    $scope.profileCounty = $scope.counties[0];
                    $scope.getTownList();
                } else if (userHasCounty && countyId) {
                    $scope.getTownList(townId);
                }

            });
    };
    $scope.getTownList = function(townId) {
        var userHasTown = false;
        remoteApiService.getTownList($scope.profileCity.id, $scope.profileCounty ? $scope.profileCounty.id : '')
            .then(function(data) {
                $scope.towns = [];
                for (var index in data.datas.rows) {
                    var town = {};
                    town = angular.copy(data.datas.rows[index]);
                    $scope.towns.push(town);
                    if (townId) {
                        if (town.id == townId) {
                            $scope.profileTown = town;
                            userHasTown = true;
                        }
                    }
                }
                if (!userHasTown) {
                    $scope.profileTown = $scope.towns[0];
                }
            });
    };
    $scope.submitApplyForm = function() {
        var name = $scope.name;
        var IDNo = $scope.ID_Num;
        var companyName = $scope.companyName;
        var phoneNum = $scope.phoneNum;
        var address = {
            'province': $scope.profileProvince._id,
            'city': $scope.profileCity._id,
            'county': $scope.profileCounty ? $scope.profileCounty._id : '',
            'town': $scope.profileTown ? $scope.profileTown._id : '',
            'details': $scope.detailAddress
        };
        remoteApiService.fillRSCinfo(name, IDNo, companyName, address, phoneNum)
            .then(function(data) {
                if (data.code == 1000) {
                    //sweetalert('县级网点资料保存成功', 'my_xxnr.html');
                    var message = '<img class="xxnr--flash--icon" src="images/correct_prompt.png" alt="">县级网点资料保存成功';
                    var id = Flash.create('success', message, 3000, {"class": 'xxnr-success-flash', "id": 'xxnr-success-flash'}, false);
                    $timeout(function(){
                        window.location.href = "/my_xxnr.html";
                        return false
                    },3000);
                } else {
                    //sweetalert(data.message, 'my_xxnr.html');
                    var message = '<img class="xxnr--flash--icon" src="images/error_prompt.png" alt="">'+data.message;
                    var id = Flash.create('success', message, 3000, {"class": 'xxnr-warning-flash', "id": 'xxnr-warning-flash'}, false);
                    $timeout(function(){
                        window.location.href = "/my_xxnr.html";
                        return false
                    },3000);
                }
            });
    };

    remoteApiService.getBasicUserInfo()
        .then(function(data) {
            if (data.datas.RSCInfoVerifing || data.datas.isRSC) {
                remoteApiService.getRSCinfo()
                    .then(function(data) {
                        $scope.hasAppliedCounty = true;
                        $scope.name = data.RSCInfo.name ? data.RSCInfo.name : "";
                        $scope.ID_Num = data.RSCInfo.IDNo ? data.RSCInfo.IDNo : "";
                        $scope.companyName = data.RSCInfo.companyName ? data.RSCInfo.companyName : "";
                        $scope.phoneNum = data.RSCInfo.phone ? data.RSCInfo.phone : "";
                        $scope.detailAddress = data.RSCInfo.companyAddress ? data.RSCInfo.companyAddress.details : "";
                        getProvinceList(
                            data.RSCInfo.companyAddress.province.id,
                            data.RSCInfo.companyAddress.city.id,
                            data.RSCInfo.companyAddress.county ? data.RSCInfo.companyAddress.county.id : '',
                            data.RSCInfo.companyAddress.town ? data.RSCInfo.companyAddress.town.id : ''
                        );
                    });
            }
        });
    getProvinceList();
});
app.directive('under12', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(modelValue) {
                if (modelValue.length > 0 && modelValue.gblen() <= 12) {
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

var ID_REGEXP = /^[1-9][0-7]\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;
app.directive('idverfied', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (ID_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('idverfied', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('idverfied', false);
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
