const { addFavoriteServieces, getFavoritesServices, deleteUserFavoritesService } = require("../../services/Favorites/favoritesServices");

const AddNewFavoritesController = async (req, res) => {
    const { userId, productId } = req.body;
    try {
        if (!userId || !productId) {
            return res.status(400).send("Check the data ");
        }
        else {
            await addFavoriteServieces(req.body, (err, data) => {
                if (err) {
                    res.status(400).send(err.error)
                } else {
                    res.status(200).send(data)
                }
            })
        }
    } catch (error) {
        res.status(500).send({ error: { description: error.message } });
    }
}

const getFavoritesController = async (req, res) => {
    const userId = req.query.userId
    try {
        if (!userId) {
            res.status(400).send({ message: "Check Your UserId" })
        }
        else {
            await getFavoritesServices(req.query, (err, data) => {
                if (err) {
                    res.status(400).send(err.error)
                }
                else {
                    res.send(data)
                }
            })
        }
    } catch (error) {
        res.status(500).send({ error: { description: error.message } });
    }
}
const deleteUserFavoritesController = async (req, res) => {
    const user_id = req.query.userId;
    const product_id = req.query.productId;
    try {
        if (!user_id || !product_id) {
            res.status(400).send("Check the data")
        }
        else {
            await deleteUserFavoritesService(req.query, (err, data) => {
                if (err) {
                    res.status(400).send(err.error)
                }
                else {
                    res.status(200).send(data)
                }
            })
        }
    } catch (error) {
        res.status(500).send()
    }
}
module.exports = { AddNewFavoritesController, getFavoritesController, deleteUserFavoritesController };