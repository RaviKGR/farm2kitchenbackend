const { db } = require("../../confic/db");

const addFavoriteServieces = async (input, output) => {
    const user_id = input.userId;
    const product_id = input.productId;
    const insertFavorite = `INSERT INTO favorites (user_id,product_id) values (?,?)`;
    db.query(insertFavorite, [user_id, product_id], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null)
        }
        else {
            output(null, { message: 'favorite added successfully' })
        }
    })
}
const getFavoritesServices = async (input, output) => {
    const userId = input.userId;
    const allFavorites = `SELECT * FROM favorites WHERE user_id = ?`
    db.query(allFavorites, [userId], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null)
        }
        else {
            output(null, result);
        }
    })
}
const deleteUserFavoritesService = async (input, output) => {
    const userId = input.userId;
    const productId = input.productId;
    const deletefavorite = `DELETE FROM favorites WHERE user_id=? AND product_id=?`;
    db.query(deletefavorite, [userId, productId], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null)
        }
        else {
            output(null, { message: 'Deleted favorite successfully' });
        }
    })
}

module.exports = { addFavoriteServieces, getFavoritesServices, deleteUserFavoritesService };