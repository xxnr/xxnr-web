/**
 * Created by pepelu on 2015/9/8.
 */
var app = angular.module('user_center', ['xxnr_common', 'shop_cart']);
app.filter('fixedTwo', function () {
    return function(input) {
      return input = input.toFixed(2);
    };
});
app.controller('userCenterController', function($scope, $rootScope, remoteApiService, payService, loginService, commonService, fileUpload, sideService) {
    var user = commonService.user;

    $scope.avatarChange = false;
    $scope.uploaded = false;


    $scope.showModifyPwd = function() {
        $scope.isOverflow = true;
        $scope.showPop = true;
    };
    $scope.closePop = function() {
        $scope.isOverflow = false;
        $scope.showPop = false;
        $scope.showAvatarPop = false;
    };
    $scope.closeAvatarPop = function() {
        $scope.isOverflow = false;
        $scope.showAvatarPop = false;
        fileUpload.resetOriginal($scope.user.imgUrl);
    };
    $scope.showAvatarChange = function() {
        window.scrollTo(0, 0);
        $scope.isOverflow = true;
        $scope.showAvatarPop = true;
    };

    $scope.confirmUploadAvatar = function() {
        console.log($rootScope.uploaded);
        if ($rootScope.uploaded) {
            var newImageUrl = fileUpload.getNewImageUrl();
            var newImageName = newImageUrl.substr(newImageUrl.lastIndexOf('/') + 1, newImageUrl.length - 1);
            remoteApiService.confirmUpload(newImageName)
                .then(function(data) {
                    if (data.code == 1000) {
                        window.location.href = window.location.href;
                    } else {
                        //sweetalert('上传头像失败',' ');
                    }
                });
        }
    };


    var checkNewPassword = function() {
        if ($scope.newPassword) {
            if ($scope.newPassword.length >= 6) {
                return true;
            } else {
                sweetalert('密码长度需大于6位');
            }
        } else {
            sweetalert('请输入密码');
        }
        return false;
    };
    var checkConfirmNewPassword = function() {
        if ($scope.confirm_newPassword) {
            if ($scope.confirm_newPassword.length >= 6) {
                if ($scope.newPassword == $scope.confirm_newPassword) {
                    return true;
                } else {
                    sweetalert('两次密码不一致');
                }
            } else {
                sweetalert('密码长度需大于6位');
            }
        } else {
            $scope.showAlert('请再次输入密码');
        }
    };

    /////////////////////////////////////

    var sweetalert = commonService.sweetalert;

    /////////////////////////////////////

    $scope.user = {};
    $scope.orderList = [];
    $scope.searchIndex = [];
    $scope.showTypes = [{
        name: '所有订单',
        isSelected: true
    }, {
        id: 1,
        name: '待付款',
        isSelected: false
    }, {
        id: 2,
        name: '待发货',
        isSelected: false
    }, {
        id: 3,
        name: '已发货',
        isSelected: false
    }];

    remoteApiService.getPointList(1, 10)
        .then(function(data) {
            $scope.user.points = data.datas.pointLaterTrade;
        });

    remoteApiService.getBasicUserInfo()
        .then(function(data) {
            $scope.user.phoneNumber = data.datas.phone;
            $scope.user.imgUrl = data.datas.photo;
            $scope.user.name = data.datas.name;
            $scope.user.isUserInfoFullFilled = data.datas.isUserInfoFullFilled;
            if (!$scope.user.imgUrl) {
                $scope.user.imgUrl = "images/default_avatar.png"
            }
            $scope.user.nickname = data.datas.nickname;
            $scope.user.address = data.datas.address.province.name + " " + data.datas.address.city.name + " " + (data.datas.address.county?data.datas.address.county.name:'') + " " + (data.datas.address.town?data.datas.address.town.name:'');
            $scope.user.sex = data.datas.sex;
            $scope.user.typeNum = data.datas.userType;
            $scope.user.isVerified = data.datas.isVerified;
            switch (data.datas.userType) {
                case '2':
                    $scope.user.type = "种植大户";
                    break;
                case '3':
                    $scope.user.type = "村级经销商";
                    break;
                case '4':
                    $scope.user.type = "乡镇经销商";
                    break;
                case '5':
                    $scope.user.type = "县级经销商";
                    break;
                default:
                    $scope.user.type = "其他";
            }
        });

    //remoteApiService.getAddressList()
    //    .then(function(data){
    //        if(data && data.datas && data.datas.rows && data.datas.rows.length){
    //            var contact = data.datas.rows[0];
    //$scope.user.name = contact.receiptPeople;
    //$scope.user.address = contact.areaName + " " + contact.cityName + " " + contact.countyName + " " + contact.address;
    //    }
    //    else{
    //        console.warn('getAddressList failed - no available address');
    //    }
    //});
    $scope.modifyPwd = function() {
        if (checkNewPassword() && checkConfirmNewPassword()) {
            remoteApiService.getPublicKey()
                .then(function(data) {
                    var public_key = data.public_key;
                    var encryptedOld = encrypt(public_key, $scope.oldPassword);
                    var encryptedNew = encrypt(public_key, $scope.newPassword);
                    remoteApiService.modifyPassword(encodeURI(encryptedOld), encodeURI(encryptedNew))
                        // remoteApiService.modifyPassword($scope.oldPassword, $scope.newPassword)
                        .then(function(data) {
                            if (data.code == 1000) {
                                loginService.logout();
                                sweetalert('修改密码成功', "logon.html");
                                //window.location.href = 'logon.html';
                            } else {
                                sweetalert(data.message);
                            }
                        })
                })
        }
    };

    function encrypt(public_key, password) {
        var public_key = public_key;
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(public_key);
        return encrypt.encrypt(password);
    }

    $scope.user.nickname_editing = false;
    $scope.user.nickname_action_name = '修改';
    $scope.modifyNickname = function() {
        if ($scope.user.nickname_editing) {
            //is editing, submit change
            remoteApiService.getPublicKey()
                .then(function(data) {
                    remoteApiService.modifyNickname($scope.user.nickname)
                        .then(function(data) {
                            if (data.code == 1000) {
                                // submit success, change to not editing, show changed nick name
                                $scope.user.nickname_editing = false;
                                $scope.user.nickname_action_name = '修改';
                                sweetalert('修改昵称成功', 'my_xxnr.html');
                            } else {
                                //submit fail
                                sweetalert(data.message);
                            }
                        })
                })
        } else {
            // is not editing, change to editing
            $scope.user.nickname_editing = true;
            $scope.user.nickname_action_name = '提交';
        }
    };

    $scope.current_page = 1;
    $scope.pages_count = 0;

    var generate_page = function() {
        $scope.pages = [];
        for (var id = 1; id <= $scope.pages_count; id++) {
            $scope.pages.push({
                id: id,
                isSelected: false
            });
        }
        if ($scope.pages.length > 0) {
            $scope.pages[0].isSelected = true;
        }
        for (var pageIndex in $scope.pages) {
            if ($scope.pages[pageIndex].id == $scope.current_page) {
                $scope.pages[pageIndex].isSelected = true;
            } else {
                $scope.pages[pageIndex].isSelected = false;
            }
        }
    };
    $scope.show_page = function(pageId) {
        $scope.current_page = pageId;
        for (var pageIndex in $scope.pages) {
            if ($scope.pages[pageIndex].id == pageId) {
                $scope.pages[pageIndex].isSelected = true;
            } else {
                $scope.pages[pageIndex].isSelected = false;
            }
        }
        for (var i = 0; i < $scope.showTypes.length; i++) {
            if ($scope.showTypes[i].isSelected == true) {
                $scope.show($scope.showTypes[i].id, i);
            }
        }


    };

    $scope.pre_page = function() {
        if ($scope.current_page > 1) {
            $scope.current_page--;
            $scope.show_page($scope.current_page);
        }
    };
    $scope.next_page = function() {
        if ($scope.current_page < $scope.pages_count) {
            $scope.current_page++;
            $scope.show_page($scope.current_page);
        }
    };


    $scope.show = function(showTypeId, index, reset) {
        if (reset > 0) {
            $scope.current_page = 1;
        };
        remoteApiService.getOrderList($scope.current_page, showTypeId)
            .then(function(data) {
                $scope.orderList = [];
                $scope.pages_count = data.pages;
                generate_page();
                var orders = data.items;
                $scope.searchIndex = [];
                for (var showType in $scope.showTypes) {
                    $scope.showTypes[showType].isSelected = false;
                }
                $scope.showTypes[index].isSelected = true;

                for (var i = 0; i < orders.length; i++) {
                    //                    if(showTypeIds != 0 && showTypeIds.indexOf(orders[i].type) == -1){
                    //                        continue;
                    //                    }

                    if (!orders[i].products || !(orders[i].products instanceof Array) || orders[i].products.length <= 0) {
                        continue;
                    }

                    var order = {};

                    for (var j in orders[i]) {
                        if (orders[i].hasOwnProperty(j)) {
                            order[j] = orders[i][j];
                        }
                    }

                    //if(orders[i].products.length==0){
                    //    continue;
                    //}

                    order.id = orders[i].id;
                    order.orderNo = orders[i].paymentId;
                    order.totalPrice = orders[i].price.toFixed(2);
                    // order.totalPrice = orders[i].deposit?orders[i].deposit.toFixed(2):orders[i].price;
                    switch (parseInt(orders[i].payType)) {
                        case 1:
                            order.payType = '支付宝支付';
                            //order.payUrl = payService.aliPayUrl(order.id);
                            break;
                        case 2:
                            order.payType = '银联支付';
                            //order.payUrl = payService.unionPayUrl(order.id);
                            break;
                    }

                    order.receiver = orders[i].consigneeName;
                    order.address = orders[i].consigneeAddress;
                    order.phone = orders[i].consigneePhone;
                    order.deliveryTime = orders[i].dateDelivered;
                    order.createTime = orders[i].dateCreated;
                    var d = new Date(commonService.parseDate(orders[i].dateCreated));
                    order.createTime_local = d.toLocaleString();
                    if (orders[i].payStatus == 1 && !orders[i].isClosed) {
                        order.statusName = '待付款';
                        order.actionName = '去付款';
                        order.showAction = true;
                        order.action = function(order) {
                            window.location.href = "commitPay.html?id=" + order.id;
                        }
                    } else if (orders[i].payStatus == 2 && orders[i].deliverStatus == 1) {
                        order.statusName = '待发货';
                        order.actionName = '联系客服';
                        order.showAction = false;
                    } else if (orders[i].payStatus == 2 && orders[i].deliverStatus == 2 && !orders[i].confirmed) {
                        order.statusName = '已发货';
                        order.actionName = '确认收货';
                        order.showAction = false;
                        order.action = function(order) {
                            if (confirm('确认收货')) {
                                //remoteApiService.confirmReceipt(order.id)
                                //    .then(function (data) {
                                //        alert("确认订单成功");
                                //        window.location.reload();
                                //    })
                            }
                        }
                    } else if(orders[i].payStatus == 3){
                        order.statusName = '部分付款';
                        order.actionName = '去付款';
                        order.showAction = true;
                        order.action = function(order){
                            window.location.href = "commitPay.html?id=" + order.id;
                        }
                    } else if (orders[i].confirmed) {
                        order.showAction = false;
                        order.statusName = '已完成';
                        order.actionName = '联系客服';
                    } else {
                        order.showAction = false;
                        order.statusName = '已关闭';
                        order.actionName = '联系客服';
                    }

                    $scope.searchIndex[order.id] = $scope.orderList.push(order) - 1;
                }
            });
    };

    $scope.show(null, 0);
    // add other properties of userInfo

    $scope.finishPay = function() {
        window.location.reload();
    };
    $scope.notFinishPay = function() {
        $scope.isOverflow = false;
        $scope.showPayPop = false;

    };

});
