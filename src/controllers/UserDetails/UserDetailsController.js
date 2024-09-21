const { getUerDetailServieces, updateUserDetailServices } = require("../../services/UserDetails/UserDetailServieces");

const getUserDetailController = async (req, res) => {
    const userId = req.query.userId;
    try {
        if (!userId) {
            return res.status(400).send("Check the UserId")
        }
        else {
            await getUerDetailServieces(req.query, (err, data) => {
                if (err) {
                    return res.status(500).send(err)
                }
                else {
                    return res.status(200).send(data)
                }
            })
        }
    } catch (error) {
        res.status(500).send({ error: "Internal server error" })

    }
}
const updateUserDetailController = async (req, res) => {
    try {
        const { name, password, userId } = req.body;

        // Validate required fields
        if (!name || !password || !userId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        // Call the service to update user details
        const result = await updateUserDetailServices(req.body);
        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error in updateUserDetailController:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
module.exports = { getUserDetailController, updateUserDetailController };