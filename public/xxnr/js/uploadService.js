app.service('fileUpload',function (commonService,$rootScope) {
    var newImageUrl = '';
    this.getNewImageUrl = function(){
        return newImageUrl;
    };


    this.resetOriginal = function(originalImgUrl){
        $(".original").css('background',"url(../images/background-img.png)");
        $(".oldAvatarImg").attr("src",originalImgUrl);
        $('#file_upload').uploadify('upload', '*');
        $("#file_upload-button").css('display','block');
        $(".newAvatarBody").unbind('mouseenter mouseleave');
        $rootScope.uploaded = false;
        //console.log(commonService.user);
    };
    $('#file_upload').uploadify({
        'swf'      : 'resources/uploadify.swf',
        'uploader' : '/api/v2.0/user/upload?userId='+commonService.user.userid,
        'buttonText': '上传图片',
        'fileTypeDesc' : 'Image Files',
        'fileTypeExts' : '*.gif; *.jpg; *.png; *.bmp',
        'fileSizeLimit' : '2MB',
        'onSelectError' : function(file, errorCode, errorMsg){
            if(errorCode == SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT){
                this.queueData.errorMsg = "文件超出大小!!";
            }
        },
        'onUploadSuccess' : function(file, data, response) {
            //console.log(data);
            var data = JSON.parse(data);
            newImageUrl = data.imageUrl;
            //console.log(newImageUrl);
            $(".original").css('background',"url("+data.imageUrl+")");
            $(".original").css('background-size','cover');
            $(".original").css('background-position','center');
            $(".swfupload").css('background',"url(../images/camera.png)");
            $(".swfupload").css('opacity',"0");
            $(".newAvatarBody").hover(function(){
                $(".swfupload").css("opacity","1");
                //console.log("in");
            },function(){
                $(".swfupload").css("opacity","0");
                //console.log("out");
            });
            $("#file_upload-button").css('display','none');
            $(".oldAvatarImg").attr("src",data["imageUrl"]);
            $rootScope.uploaded = true;
        },
        'onUploadError' : function(file, errorCode, errorMsg, errorString) {
            alert('The file ' + file.name + ' could not be uploaded: ' + errorString);
        }
        // Put your options here
    });
});
