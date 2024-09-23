const getOrderHistoryServieces = require("../../services/OrderHistory/OrderHistoryServieces");

const getOrderHistoryController = async (req, res) => {
    try {
        const userId = req.query.userId;
        const input = { userId };

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const result = await getOrderHistoryServieces(input);
        return res.status(200).json( result );

    } catch (error) {
        console.error('Error in getOrderHistoryController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve order history',
        });
    }
};

module.exports = getOrderHistoryController;
