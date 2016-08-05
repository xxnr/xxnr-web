/**
 * Created by xxnr-cd on 16/7/18.
 */
var config = (function () {
    var configObj = {};

    //configObj.baseURI = 'http://101.200.194.203';
    configObj.baseURI = '';
    configObj.mobileBaseURI = 'http://192.168.1.21:8080';
    //configObj.mobileBaseURI = 'http://mppe.xinxinnongren.com';
    configObj.ajaxGet = function (apiURI,data) {
        var deferred = $.Deferred();
        var _apiURI = apiURI?apiURI:'';
        $.ajax({
            type:"GET",
            url: _apiURI,
            data:data,
            success:function(data) {
                deferred.resolve(data);
            },
            error:function(error) {
                console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + apiURI + ', and BaseUrl = ' + mobileBaseURI);
            }
        });

        return deferred.promise();
    };
    configObj.ajaxPost = function (apiURI,data) {
        var deferred = $.Deferred();
        var _apiURI = apiURI?apiURI:'';
        $.ajax({
            type:"POST",
            url: _apiURI,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success:function(data) {
                deferred.resolve(data);
            },
            error:function(error) {
                console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + apiURI + ', and BaseUrl = ' + mobileBaseURI);
            }
        });

        return deferred.promise();
    };
    configObj.shareAndGetPointsEventId = '57959c61a91948c547fd69a7';
    configObj.jacCarsQuizEventId = '57959892a91948c547fd699d';
    return configObj;
}());