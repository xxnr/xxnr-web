module.exports = {
    calculatePrice : function calculatePrice(product, count, userId){
		return (product.deposit?product.deposit:product.price) * (product.discount || 1.0) * (count || 1);
	},
    calculateDiscountPrice : function calculateDiscountPrice(product, count, userId){
        return product.price * (product.discount || 1.0) * (count || 1);
    }
};