
var detailUtils=(function() {
	
	// details_tab
	$(function(){
		$(".search_category").each(function(){
			var $this = $(this);
			$this.find("ul li a").click(function(){
				$(this).parent().siblings().find("a").removeClass("current");
				$(this).addClass("current");
			})
		});

		$(".intro_list .intro_box").hide();
		$(".intro_list .intro_box:first").show();
		$(".details_tab li a").click(function(){
			var $index = $(this).parent().index();
			$(".details_tab li a").removeClass("current");
			$(this).addClass("current");
			$(".intro_list .intro_box").eq($index).show().siblings(".intro_box").hide();
		})
		
	});

    var user= $.parseJSON(sessionStorage.getItem("user"));
    if(!user){
        user={
            userid:'',
            userType:''
        };
    }
    console.log('user',user);
    var Request = RuiDa.Tool.GetRequest(), productId = Request['id'];
    var shoppingCartList = [];
    var cartItem = {
        goodsId:'', //商品id
        goodsName:'',//商品名称
        originalPrice:0,//商品原价
        unitPrice:0,//商品单价
        imgUrl:'',//商品缩略图
        count:0//商品购买数量
    };
    function start()
    {
        console.log('shangpinid>>>>>>>>>>>>>>>>>' + productId);
        detail();
    }
    function detail(){
        var params={
            'methodname':'/api/v1.0/getProductDetails/',
            'userId':user.userid,
            'id':productId
        };
        Rui.Ajax(params,function(res){
            console.log('商品详情接口成功', JSON.stringify(res));
            writeAllProductsToHtml(res);
        });
    }

    function writeAllProductsToHtml(product){
        $('.product_detail').html('');
        // for(var index in list){
            // var goods = list[index];
			$('#product_title').html(product.name);
            var goodsIdVal = '<input type="hidden" id="goodsId" value="' + product.id+ '">';
            var div = 
                  '<div class="product_img">'+
                  '<img src="'+publicweburl.weburl1 + product.imgUrl+'"/>'+
                  '</div>'+
				  '<div class="product_info">' +
					  '<div class="product_info_part1">' +
						  '<h4 class="product_name">'+product.name+'</h4>'+
						  '<p class="sub_tit">'+product.description+'</p>';

			var points = '<p></p>';
            var user = JSON.parse(sessionStorage.getItem('user'));
            if(user && user.userType == 3){
				var originalPriceHtml = (product.hasDiscount)?'':'<span class="old_price">' + product.price + '</span></p>';
                div +=
					'<p class="price"><span>¥' + product.discountPrice + '</span>'+originalPriceHtml;
				points = '<p>' + product.payWithScoresLimit + '积分抵现' + product.payWithScoresLimit + '元' + '</p>';
            } else {
                div +=
					'<p class="price"><span>¥' + product.price + '</span></p>';
            }
			
			div +='</div>' +
				  '<div class="buy_box">' +
					'<div class="left buy_btn">' +
						'<a class="btn-reduce" href="javascript:;">-</a>' +
						'<a class="btn-add" href="javascript:;">+</a>' +
						'<input class="text" id="buy-num" value="1">' +
					'</div>' +
					'<a href="#" class="buy">立即购买</a>' +
					'<a href="#" class="shopping_car">加入购物车</a>' +
				'</div>' +
				points +
				  '</div>';
			
            $('.product_detail').append($(goodsIdVal));
            $('.product_detail').append($(div));
			
			var $num = $("#buy-num").val();
			$(".btn-add").click(function(){
				$num++;
				$("#buy-num").val($num);
			});
			$(".btn-reduce").click(function(){
				$num--;
				if($num < 0){
					$num = 0;
				}
				$("#buy-num").val($num);
			});
			
            var product_img = '<img src="'+publicweburl.weburl1 + product.imgUrl +'" alt=""/>';
            var product_standard = product.specification;
            var product_common = product.comments;
            if(product.comments){
                var comments = product.comments;
                for(var i in comments){
                    //TODO 添加评论

                }
            }
            var product_support = product.support;
			var fenshu = '<div class="left percent">' +
						'<p class="num">' + product.positiveRating + '%</p>' +
						'<p>好评率</p>' +
					'</div>';
			var stars = '<span class="left txt">建议星级：</span>' + 
						'<span class="left star';
			for(var i=1; i <= product.stars; i++){
				stars += ' star' + i;
			}
			
			stars += '""></span>';
			
            $('.intro_box .detail').append($(product_img));
            $('.intro_box .canshu').html(product_standard?product_standard : '无技术规格');
			$('.intro_box .percent').html($(fenshu));
			$('.intro_box .stars').html($(stars));
            $('.intro_box .comments_list').html(product_common);
            $('.intro_box .product_support').html(product_support?product_support:'无技术支持');
        // }
        bindOperate();
    }

    function bindOperate(){
        $(".buy").click(function(){
            cartItem.goodsId = $('#goodsId').val();
            cartItem.goodsName = $('.product_name').text();
            cartItem.count = $('#buy-num').val();
            cartItem.imgUrl = $('.product_img img').attr('src');
            cartItem.originalPrice = $('.old_price').val();
            cartItem.unitPrice = $('.price').val();
            addGoodsToBuy(cartItem);
            pushShoppingCart(cartItem);
            //window.location.href='confirm-order.html';
        });
        $(".shopping_car").click(function(){
            cartItem.goodsId = $('#goodsId').val();
            cartItem.goodsName = $('.product_name').text();
            cartItem.count = $('#buy-num').val();
            cartItem.imgUrl = $('.product_img img').attr('src');
            cartItem.originalPrice = $('.old_price').val();
            cartItem.unitPrice = $('.price').val();
            addGoodsToCart(cartItem);
            pushShoppingCart(cartItem);
            //window.location.href='shoppingcar.html';
        });
		
    }

    function addGoodsToCart(item){
        var user = $.parseJSON(sessionStorage.getItem('user'));
        console.log(user);
        if(user!=null&&user.userid!=null&&user.userid!=""){
            var params = {
                methodname:'app/shopCart/addToCart',
                locationUserId:user==null?'':user.userid,
                goodsId:item.goodsId,
                userId:user.userid,
                count:item.count
            };

            Rui.Ajax(params,function(res){
                console.info(res);
                if(res.code='1000'){
                    alert('添加成功');
                    setTimeout(function(){
                        window.location.href="shoppingcar.html";
                    },500);
                } else {
                    console.error(res.message);
                }
            });
        }else{
            window.location.href='login.html';
        }

    }
    //立即购买
    function addGoodsToBuy(item){
        var user = $.parseJSON(sessionStorage.getItem('user'));
        console.log(user);
        if(user!=null&&user.userid!=null&&user.userid!=""){
            var params = {
                methodname:'app/shopCart/addToCart',
                locationUserId:user==null?'':user.userid,
                goodsId:item.id,
                userId:user.userid,
                count:item.count
            };

            Rui.Ajax(params,function(res){
                console.info(res);
                if(res.code='1000'){
                    alert('添加成功');
                    setTimeout(function(){
                        window.location.href="pretreatment-order.html";
                    },500);
                } else {
                    console.error(res.message);
                }
            });
        }else{
            window.location.href='login.html';
        }

    }
    function getShoppingCart(){
        var t = localStorage.getItem('shoppingCartList');
        if(t){
            shoppingCartList = JSON.parse(t);
        }
        return shoppingCartList;
    }

    function pushShoppingCart(item){
        getShoppingCart().push(item);
        localStorage.setItem('shoppingCartList',JSON.stringify(shoppingCartList));
    }



    return {
        start:start
    };
})();
detailUtils.start();



