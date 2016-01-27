module.exports = {
    calculatePrice : function calculatePrice(product, count, userId){
		return (product.deposit?product.deposit:(product.SKUPrice? product.SKUPrice.min : product.price)) * (product.discount || 1.0) * (count || 1);
	},
    calculateDiscountPrice : function calculateDiscountPrice(product, count, userId){
        return (product.SKUPrice? product.SKUPrice.min : product.price) * (product.discount || 1.0) * (count || 1);
    }
};