const { CreatePlaceOrder } = require("../../services/PlaceOrder/PlaceOrderServices");

const PlaceOrderController = async (req, res) => {
    const { productId, variantId, price, quantity } = req.body;    
    try {

        if (!productId || !variantId || !price || !quantity) {
            return res.status(400).json({ message: 'Check the data' })
        }
        else {
            const result = await CreatePlaceOrder(req.body)
           
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}
module.exports = { PlaceOrderController };     