const { AddCartService, getCartService } = require("../../services/AddCartServices/AddCartServices");

const AddCartController = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Check the data' })
        }
        else {
            await AddCartService(req.body, (err, data) => {
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
const getCartController = async (req, res) => {
    try {
        const result = await getCartService();
        if (!result || result.error) {
            console.error('Service error in getCartController:', result.error);
            return res.status(400).json({
                success: false,
                message: result.error || 'Error retrieving cart data'
            });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getCartController:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}

module.exports = { AddCartController, getCartController };