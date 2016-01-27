module.exports = {
    api10 : new function(){
        this.convertProduct = function(product){
            var result = {};
            if(product.SKUPrice){
                product.price = product.SKUPrice.min;
            }
            product.discount = product.discount || 1.0;
            product.discountPrice = product.discountPrice || calculateDiscountPrice(product);

            for(var i in product){
                if(product.hasOwnProperty(i)){
                    /*if(i == "body"){
                        result["description"] = product.body;
                        continue;
                    }*/

                    if(i == "pictures"){
                        var pictures = [];
                        product.pictures.forEach(function(pic){
                            var picture = {};
                            picture.imgUrl = "/images/large/" + product.linker_category + '/' + pic + ".jpg?category=" + product.linker_category;
                            picture.thumbnail = "/images/thumbnail/" + product.linker_category + '/' + pic + ".jpg?category=" + product.linker_category + '&thumb=true';
                            picture.originalUrl = "/images/original/" + product.linker_category + '/' + pic + ".jpg";
                            pictures.push(picture);
                        });

                        result.imgUrl = pictures[0] ? pictures[0].imgUrl : '';
                        result.thumbnail = pictures[0] ? pictures[0].thumbnail : '';
                        result.originalUrl = pictures[0] ? pictures[0].originalUrl : '';
                        result.pictures = pictures;
                        continue;
                    }

                    if(i == 'linker_category'){
                        result.categoryId = product.linker_category;
                        continue;
                    }

                    result[i] = product[i];
                }
            }
            
            // TODO:
            if(typeof result.payWithScoresLimit == 'undefined'){
                result.payWithScoresLimit = 0;
            }
            
            // TODO: specification, comments, 

            return result;
        };

        this.convertProducts = function(products){
            var result = [];

            for(var i=0; i<products.length; i++){
                result.push(this.convertProduct(products[i]));
            }

            return result;
        };
        
        this.convertCategory = function(category, categoryObject){
            var result = {};
            
            for(var i in category){
                if(category.hasOwnProperty(i)){
                    if(i == "linker"){
                        result["id"] = category.linker;
                        continue;
                    }

                    result[i] = category[i];
                }
            }
            
            if(categoryObject){
                for(var i in categoryObject){
                    if(categoryObject.hasOwnProperty(i)){
                        result[i] = categoryObject[i];
                    }
                }
            }

            result.url = result.url || (encodeURI(result.name) + '.html');
            result.imgUrl = result.imgUrl || ("images/" + encodeURI(result.id) + '.png');
            result.title = result.title || result.name;
            
            return result;
        };
        
        this.convertCategories = function(categories, mapCategoriesObjects){
            mapCategoriesObjects = mapCategoriesObjects || {};
            var result = {categories:[]};

            for(var i=0; i<categories.length; i++){
                result.categories.push(this.convertCategory(categories[i], mapCategoriesObjects.hasOwnProperty(categories[i].linker) ? mapCategoriesObjects[categories[i].linker] : null));
            }

            return result;
        };
    }
};

var calculatePrice = require('../common/calculator').calculatePrice;
var calculateDiscountPrice = require('../common/calculator').calculateDiscountPrice;

exports.convertOptions = function(options, mapping){
    for(var i in mapping){
        if(mapping.hasOwnProperty(i) && options.hasOwnProperty(i) && i!=mapping[i]){
            options[mapping[i]] = options[i];
            delete options[i];
        }
    }
};