const { CreatePlaceOrder } = require("../../services/PlaceOrder/PlaceOrderServices");

const PlaceOrderController = async (req, res) => {
    try {
        const { productId, variantId, price, quantity } = req.body;
        const input = { productId, variantId, price, quantity };
        if (!productId || !variantId || !price || !quantity) {
            return res.status(400).json({ message: 'Check the data' })
        }
        else {
            await CreatePlaceOrder(input, (err, data) => {
                if (err) {
                    return res.status(400).json(err.error);
                }
                else {
                    return res.status(200).json(data)
                }
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}
module.exports = { PlaceOrderController };     