/**
 * Created by pepelu on 2015/9/8.
 */
var app = angular.module('user_center', ['xxnr_common', 'shop_cart']);
app.filter('fixedTwo', function () {
    return function(input) {
      return input = input.toFixed(2);
    };
});
app.controller('userCenterController', function($scope, $rootScope,$timeout ,remoteApiService, payService, loginService, commonService, fileUpload, sideService) {
    var user = commonService.user;
    $scope.nickname_adding = false;
    $scope.avatarChange = false;
    $scope.uploaded = false;

    $scope.showConfirmSKUReceivedPop = false; //确认收货的弹窗变量
    $scope.ConfirmingSKUs = [];  //要确认的收货物品列表
    $scope.ConfirmingSKU_refs = [];  //要确认的收货物品id列表
    $scope.ConfirmingOrderIds;  //要确认的收货物品列表

    $scope.showPickupPop = false; //去自提的弹窗变量


    $scope.showModifyPwd = function () {
        window.scrollTo(0, 0);
        $scope.isOverflow = true;
        $scope.showPop = true;
    };
    $scope.closePop = function () {
        $scope.isOverflow = false;
        $scope.showPop = false;
        $scope.showAvatarPop = false;
        $scope.showConfirmSKUReceivedPop = false;
        $scope.showPickupPop = false;
        $scope.ConfirmingOrderIds = null;
    };
    $scope.closeAvatarPop = function () {
        $scope.isOverflow = false;
        $scope.showAvatarPop = false;
        fileUpload.resetOriginal($scope.user.imgUrl);
    };
    $scope.showAvatarChange = function () {
        window.scrollTo(0, 0);
        $scope.isOverflow = true;
        $scope.showAvatarPop = true;
    };

    $scope.confirmUploadAvatar = function () {
        // console.log($rootScope.uploaded);
        if ($rootScope.uploaded) {
            var newImageUrl = fileUpload.getNewImageUrl();
            var newImageName = newImageUrl.substr(newImageUrl.lastIndexOf('/') + 1, newImageUrl.length - 1);
            remoteApiService.confirmUpload(newImageName)
                .then(function (data) {
                    if (data.code == 1000) {
                        window.location.href = window.location.href;
                    } else if(data.code == 1401){
                        sweetalert('你已被登出，请重新登录', "logon.html");
                    }else {
                        //sweetalert('上传头像失败',' ');
                    }
                });
        }
    };


    var checkNewPassword = function () {
        if ($scope.newPassword) {
            if ($scope.newPassword.length >= 6) {
                return true;
            } else {
                sweetalert('密码长度需大于6位');
            }
        } else {
            sweetalert('请输入新密码');
        }
        return false;
    };
    var checkConfirmNewPassword = function () {
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
            sweetalert('请填写确认密码');
        }
    };

    /////////////////////////////////////

    var sweetalert = commonService.sweetalert;

    /////////////////////////////////////

    $scope.user = {};
    //$scope.orderList = [];
    $scope.orderList = undefined;
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
        name: '待收货',
        isSelected: false
    }, {
        id: 4,
        name: '已完成',
        isSelected: false
    }];

    // remoteApiService.getPointList(1, 10)
    //     .then(function(data) {
    //         $scope.user.points = data.datas.pointLaterTrade;
    //     });

    remoteApiService.getBasicUserInfo()
        .then(function (data) {
            $scope.user.phoneNumber = data.datas.phone;
            $scope.user.imgUrl = data.datas.photo;
            $scope.user.name = data.datas.name;
            $scope.user.verifiedTypes = data.datas.verifiedTypes;
            $scope.user.isVerifiedRSC = data.datas.isRSC;
            $scope.user.isUserInfoFullFilled = data.datas.isUserInfoFullFilled;
            if (!$scope.user.imgUrl) {
                $scope.user.imgUrl = "images/default_avatar.png"
            }
            $scope.user.nickname = data.datas.nickname;
            $scope.user.hasNickname = Boolean(data.datas.nickname);
            if (data.datas.address) {
                $scope.user.address = data.datas.address.province.name + " " + data.datas.address.city.name + " " + (data.datas.address.county ? data.datas.address.county.name : '') + " " + (data.datas.address.town ? data.datas.address.town.name : '');
            }
            $scope.user.sex = data.datas.sex;
            $scope.user.typeNum = data.datas.userType;
            $scope.user.isVerified = data.datas.isVerified;
            $scope.user.isRSC = data.datas.isRSC;
            $scope.user.RSCInfoVerifing = data.datas.RSCInfoVerifing;
            $scope.user.points = data.datas.pointLaterTrade;
            // switch (data.datas.userType) {
            //     case '2':
            //         $scope.user.type = "种植大户";
            //         break;
            //     case '3':
            //         $scope.user.type = "村级经销商";
            //         break;
            //     case '4':
            //         $scope.user.type = "乡镇经销商";
            //         break;
            //     case '5':
            //         $scope.user.type = "县级经销商";
            //         break;
            //     default:
            //         $scope.user.type = "其他";
            // }
            remoteApiService.userTypeList()
                .then(function (data) {
                    $scope.user.type = data.data[$scope.user.typeNum]
                });
            // set user nickname to cookie
            if (data && data.datas && data.datas.nickname) {
                var cookieUser = loginService.getUser();
                if (cookieUser) {
                    cookieUser['nickName'] = encodeURIComponent(data.datas.nickname);
                    loginService.setUser(cookieUser);
                }
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
    $scope.modifyPwd = function () {
        if (checkNewPassword() && checkConfirmNewPassword()) {
            remoteApiService.getPublicKey()
                .then(function (data) {
                    var public_key = data.public_key;
                    var encryptedOld = encrypt(public_key, $scope.oldPassword);
                    var encryptedNew = encrypt(public_key, $scope.newPassword);
                    remoteApiService.modifyPassword(encodeURI(encryptedOld), encodeURI(encryptedNew))
                        // remoteApiService.modifyPassword($scope.oldPassword, $scope.newPassword)
                        .then(function (data) {
                            if (data.code == 1000) {
                                loginService.logout();
                                sweetalert('修改密码成功', "logon.html");
                                //window.location.href = 'logon.html';
                            }else if(data.code == 1401){
                                sweetalert('你已被登出，请重新登录', "logon.html");
                            }else {
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
    $scope.modifyNickname = function () {
        if ($scope.user.nickname_editing) {
            //is editing, submit change
            remoteApiService.getPublicKey()
                .then(function (data) {
                    remoteApiService.modifyNickname($scope.user.nickname)
                        .then(function (data) {
                            if (data.code == 1000) {
                                // submit success, change to not editing, show changed nick name
                                $scope.user.nickname_editing = false;
                                $scope.user.nickname_action_name = '修改';
                                // set user nickname to cookie
                                if ($scope.user.nickname) {
                                    var cookieUser = loginService.getUser();
                                    if (cookieUser) {
                                        cookieUser['nickName'] = encodeURIComponent($scope.user.nickname);
                                        loginService.setUser(cookieUser);
                                    }
                                }
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
    $scope.addNickname = function () {
        $scope.nickname_adding = true;
        $scope.modifyNickname();
    };

    $scope.current_page = 1;
    $scope.pages_count = 0;

    var generate_page = function () {
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
        if ($scope.pages.length <= 7) {                                                     // e.g.: 1 2 3 4 5 6 7
            $scope.pages = $scope.pages;
        } else if ($scope.pages.length > 7 && $scope.current_page < 5) {                              // e.g.: 1 2 3 4 5 ... 20
            $scope.pages = $scope.pages.slice(0, 6).concat($scope.pages[$scope.pages.length - 1]);
            $scope.pages[5].id = '...';
        } else if ($scope.pages.length > 7 && $scope.current_page <= $scope.pages_count && $scope.current_page > $scope.pages_count - 4) {    // e.g.: 1 ... 16 17 18 19 20
            $scope.pages = $scope.pages.slice(0, 1).concat($scope.pages.slice($scope.pages.length - 6, $scope.pages.length));
            $scope.pages[1].id = '...';
        } else {                                                                          // e.g.: 1 .. 8 9 10 ... 20
            var tempFirst = $scope.pages[0];
            var tempLast = $scope.pages[$scope.pages.length - 1];
            $scope.pages = $scope.pages.slice($scope.current_page - 3, $scope.current_page + 2);
            $scope.pages[0].id = '...';
            $scope.pages[$scope.pages.length - 1].id = '...';
            $scope.pages.push(tempLast);
            $scope.pages.unshift(tempFirst);
        }
    };
    $scope.show_page = function (pageId) {
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

    $scope.pre_page = function () {
        if ($scope.current_page > 1) {
            $scope.current_page--;
            $scope.show_page($scope.current_page);
        }
    };
    $scope.next_page = function () {
        if ($scope.current_page < $scope.pages_count) {
            $scope.current_page++;
            $scope.show_page($scope.current_page);
        }
    };


    $scope.show = function (showTypeId, index, reset) {
        if (reset == true) {
            $scope.current_page = 1;
        }
        ;
        remoteApiService.getOrderList($scope.current_page, showTypeId)
            .then(function (data) {
                $scope.orderList = [];
                $scope.pages_count = data.pages;
                generate_page();
                var orders = data.items;
                $scope.searchIndex = [];
                for (var showType in $scope.showTypes) {
                    if ($scope.showTypes.hasOwnProperty(showType)) {
                        $scope.showTypes[showType].isSelected = false;
                    }
                }
                $scope.showTypes[index].isSelected = true;

                for (var i = 0; i < orders.length; i++) {

                    if ((!orders[i].products && !orders[i].SKUs) || (!(orders[i].products instanceof Array) && !(orders[i].SKUs instanceof Array)) || (orders[i].products.length <= 0 && orders[i].SKUs.length <= 0)) {
                        continue;
                    }

                    var order = {};

                    for (var j in orders[i]) {
                        if (orders[i].hasOwnProperty(j)) {
                            order[j] = orders[i][j];
                        }
                    }
                    if (orders[i].SKUs) {
                        if (orders[i].SKUs.length > 0) {
                            order.products = orders[i].SKUs;
                        }
                    }
                    for (var k in order.products) {
                        order.products[k].totalAdditionsPrice = $scope.calculateTotalAdditionsPrice(order.products[k].additions);
                    }


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
                    order.order = orders[i].order;
                    order.orderDeliveryType = orders[i].deliveryType;
                    //var d = new Date(commonService.parseDate(orders[i].dateCreated));
                    //order.createTime_local = d.toLocaleString();
                    order.createTime_local = commonService.convertDateIncludeHMM(orders[i].dateCreated);

                    if (order.order.orderStatus.type == 1) {
                        order.actionName = '去付款';
                        order.showAction = true;
                        order.action = function (order) {
                            window.location.href = "commitPay.html?id=" + order.id;
                        }
                    } else if (order.order.orderStatus.type == 2) {
                        order.actionName = '去付款';
                        order.showAction = true;
                        order.action = function (order) {
                            window.location.href = "commitPay.html?id=" + order.id;
                        }
                    } else if (order.order.orderStatus.type == 3) {
                        order.actionName = '联系客服';
                        order.showAction = false;
                    } else if (order.order.orderStatus.type == 4) { //配送中的订单 用户可以确认收货
                        order.actionName = '确认收货';

                        var hadSKU_deliverying = false; //判断是否有可自提SKU
                        order.SKUs.forEach(function (SKU) {
                            if (SKU.deliverStatus == 2) {
                                hadSKU_deliverying = true;
                            }
                        });
                        order.showAction = hadSKU_deliverying;
                        order.action = function (order) {
                            $scope.ConfirmingOrderIds = order.id;
                            $scope.ConfirmingSKUs = [];
                            $scope.ConfirmingSKUIndex = -1;
                            $scope.showConfirmSKUReceivedPop = true;
                            //window.scrollTo(0, 0);
                            $scope.ConfirmingSKU_refs = [];
                            $scope.isOverflow = true;
                            if (order.SKUs) {
                                for (var x in order.SKUs) {
                                    if (order.SKUs[x].deliverStatus == 2) {
                                        $scope.ConfirmingSKUs.push(order.SKUs[x]);
                                    }
                                }
                            }
                            $scope.ConfirmingSKUs.forEach(function (ConfirmingSKU) {
                                ConfirmingSKU.shortName = ConfirmingSKU.productName.length > 30 ? (ConfirmingSKU.productName.substr(0, 27) + '...') : ConfirmingSKU.productName;
                            });
                        }
                    } else if (order.order.orderStatus.type == 5) {
                        order.actionName = '去自提';

                        var hadDeliveriedCompany = false; //判断是否已到服务站
                        order.SKUs.forEach(function (SKU) {
                            if (SKU.deliverStatus == 4) {
                                hadDeliveriedCompany = true;
                            }
                        });
                        order.showAction = hadDeliveriedCompany;
                        $scope.pickupRSCInfo = null;
                        order.action = function (order) {
                            $scope.showPickupPop = true;
                            $scope.pickupOrderIds = order.id;
                            $scope.pickupOrderSKUs = [];
                            order.SKUs.forEach(function (SKU) {
                                if (SKU.deliverStatus == 4) {
                                    $scope.pickupOrderSKUs.push(SKU);
                                }
                            });
                            $scope.pickupOrderSKUs.forEach(function (pickupOrderSKU) {
                                pickupOrderSKU.shortName = pickupOrderSKU.productName.length > 30 ? (pickupOrderSKU.productName.substr(0, 27) + '...') : pickupOrderSKU.productName;
                            });
                            $scope.isOverflow = true;
                            $scope.pickupRSCInfo = order.RSCInfo;
                            remoteApiService.getDeliveryCode($scope.pickupOrderIds)
                                .then(function (data) {
                                    if (data.code == 1000) {
                                        //$scope.pickupOrderDeliveryCode = data.
                                        $scope.pickupDeliveryCode = data.deliveryCode;
                                    }else if(data.code == 1401){
                                        sweetalert('你已被登出，请重新登录', "logon.html");
                                    }else{
                                        sweetalert('获取自提码失败','my_xxnr.html');
                                    }
                                })
                        }
                    } else if (order.order.orderStatus.type == 6) {
                        order.showAction = false;
                        order.actionName = '联系客服';
                    } else if (order.order.orderStatus.type == 7) {
                        order.showAction = true;
                        order.showModifyAction = true;
                        order.actionName = '查看付款信息';
                        order.action = function (order) {
                            window.location.href = "commitPay.html?id=" + order.id + "&offlinePay=1";
                        };
                        order.modifyPay = function (order) {
                            window.location.href = "commitPay.html?id=" + order.id;
                        }
                    }

                    $scope.searchIndex[order.id] = $scope.orderList.push(order) - 1;
                }
            });
    };

    $scope.show(null, 0);
    // add other properties of userInfo

    $scope.finishPay = function () {
        window.location.reload();
    };
    $scope.notFinishPay = function () {
        $scope.isOverflow = false;
        $scope.showPayPop = false;

    };
    $scope.calculateTotalAdditionsPrice = function (additions) {
        var totalAdditionsPrice = 0;
        for (var i in additions) {
            if (additions.hasOwnProperty(i)) {
                totalAdditionsPrice = totalAdditionsPrice + Number(additions[i].price ? additions[i].price : 0);
            }
        }
        return Number(totalAdditionsPrice.toFixed(2));
    };
    $scope.addToConfirmingSKU_List = function (index) {
        if ($scope.ConfirmingSKU_refs.length == 0) {
            $scope.ConfirmingSKU_refs.push($scope.ConfirmingSKUs[index].ref);
        } else {
            var hasExsited = false;
            for (var i in $scope.ConfirmingSKU_refs) {              //如果已在$scope.ConfirmingSKUs就剔除
                if ($scope.ConfirmingSKUs[index].ref == $scope.ConfirmingSKU_refs[i]) {
                    $scope.ConfirmingSKU_refs.splice(i, 1);
                    hasExsited = true;
                }
            }
            if (!hasExsited) {
                $scope.ConfirmingSKU_refs.push($scope.ConfirmingSKUs[index].ref); //不在时就加入$scope.ConfirmingSKUs
            }
        }
    };
    $scope.checkConfirmingSKU_List = function (index) {
        if ($scope.ConfirmingSKUs.hasOwnProperty(index)) {
            if ($scope.ConfirmingSKU_refs.length > 0 && $scope.ConfirmingSKU_refs.indexOf($scope.ConfirmingSKUs[index].ref) != -1) {
                return true;
            } else {
                return false;
            }
        }
    };
    $scope.confirmSKU = function () {
        if ($scope.ConfirmingSKU_refs.length > 0) {
            remoteApiService.confirmSKU($scope.ConfirmingOrderIds, $scope.ConfirmingSKU_refs)
                .then(function (data) {
                    $scope.ConfirmingOrderIds = null;
                    if(data.code == 1000){
                        sweetalert('收货成功','my_xxnr.html');
                    }else if(data.code == 1401){
                        sweetalert('你已被登出，请重新登录', "logon.html");
                    }
                    else{
                        sweetalert('确认收货失败','my_xxnr.html');
                    }
                });
            //$scope.ConfirmingOrderIds = null;
        }
    };

    /**
     * return confirming SKU number
     * @returns {number}
     * @constructor
     */
    $scope.ConfirmingSKU_number = function () {   //计算被算中的确认收货的SKU的数量
        var resultNum = 0;
        $scope.ConfirmingSKU_refs.forEach(function (SKU_ref) {
            if ($scope.ConfirmingSKUs) {
                for (var i in $scope.ConfirmingSKUs) {

                    if ($scope.ConfirmingSKUs.hasOwnProperty(i)) {
                        if (SKU_ref == $scope.ConfirmingSKUs[i].ref) {
                            resultNum = resultNum + $scope.ConfirmingSKUs[i].count;
                        }
                    }
                }
            }
        });

        return resultNum;
    };

});
