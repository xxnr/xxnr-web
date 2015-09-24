module.exports = {
    api10 : new function(){
        this.convertProduct = function(product){
            var result = {};

            product.discount = product.discount || 1.0;
            product.discountPrice = product.discountPrice || calculatePrice(product);

            for(var i in product){
                if(product.hasOwnProperty(i)){
                    if(i == "body"){
                        result["description"] = product.body;
                        continue;
                    }

                    if(i == "pictures"){
                        var pic = product.pictures[0];
                        result.imgUrl = "/images/original/" + product.linker_category + '/' + pic + ".jpg?category=" + product.linker_category;
                        result.thumbnail = "/images/thumbnail/" + product.linker_category + '/' + pic + ".jpg?category=" + product.linker_category + '&thumb=true';
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
                result.payWithScoresLimit = result.price * 0.2;
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

            category.url = category.url || (encodeURI(category.name) + '.html');
            category.imgUrl = category.imgUrl || ("images\\" + encodeURI(category.name) + '.png');
            category.title = category.title || category.name;
            
            return result;
        };
        
        this.convertCategories = function(categories, mapCategoriesObjects){
            mapCategoriesObjects = mapCategoriesObjects || {};
            var result = [];

            for(var i=0; i<categories.length; i++){
                result.push(this.convertCategory(categories[i], mapCategoriesObjects.hasOwnProperty(categories[i].linker) ? mapCategoriesObjects[categories[i].linker] : null));
            }

            return result;
        };
    }
};

var calculatePrice = require('../common/calculator').calculatePrice;