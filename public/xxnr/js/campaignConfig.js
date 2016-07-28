/**
 * Created by xxnr-cd on 16/7/18.
 */
var config = (function () {
    var configObj = {};

    //configObj.baseURI = 'http://101.200.194.203';
    configObj.baseURI = 'http://192.168.1.21:8070';
    //configObj.baseURI = 'http://mppe.xinxinnongren.com:8070';
    configObj.ajaxGet = function (baseURI,apiURI,data) {
        var deferred = $.Deferred();
        var _baseURI = baseURI?baseURI:'';
        var _apiURI = apiURI?apiURI:'';
        var getURI = _baseURI + _apiURI;
        $.ajax({
            type:"GET",
            url: getURI,
            data:data,
            success:function(data) {
                deferred.resolve(data);
            },
            error:function(error) {
                console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + apiURI + ', and BaseUrl = ' + baseURI);
            }
        });

        return deferred.promise();
    };
    configObj.ajaxPost = function (baseURI,apiURI,data) {
        var deferred = $.Deferred();
        var _baseURI = baseURI?baseURI:'';
        var _apiURI = apiURI?apiURI:'';
        var getURI = _baseURI + _apiURI;
        $.ajax({
            type:"POST",
            url: getURI,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success:function(data) {
                deferred.resolve(data);
            },
            error:function(error) {
                console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + apiURI + ', and BaseUrl = ' + baseURI);
            }
        });

        return deferred.promise();
    };
    configObj.shareAndGetPointsEventId = '57959c61a91948c547fd69a7';
    configObj.jacCarsQuizEventId = '57959892a91948c547fd699d';
    return configObj;
}());