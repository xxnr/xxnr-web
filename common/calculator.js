module.exports = {
    calculatePrice : function calculatePrice(product, count, userId){
		return product.price * (product.discount || 1.0) * (count || 1);
	}
};