const { db } = require("../../confic/db");

const addNewPurchaseService = async (input, output) => {
    const { variantId, quantity, purchasePrice, HST, purchaseDate } = input;
    const insertQuery = `INSERT INTO productPurchase (variant_id, quantity_in_stock, purchase_price, HST, purchase_date) VALUES (?, ?, ?, ?, ?)`;
    db.query(insertQuery, [variantId, quantity, purchasePrice, HST, purchaseDate], (err, result) => {
        if(err) {
            output({ error: { description: err.message}}, null);
        } else {
            output(null, { message: "Purchase details inserted successfully"})
        }
    })
}

const getPurchaseDetailService = async (input, output) => {
    const {limit, offset} = input;
    const selectQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
    pp.variant_id,
    pp.purchase_id,
    pp.purchase_price,
    pp.quantity_in_stock,
    pp.HST,
    pp.purchase_date,
    p.product_id,
    p.name,
    p.brand
    FROM productPurchase pp
    JOIN productvariant pv ON pv.variant_id = pp.variant_id
    LEFT JOIN product p ON p.product_id = pv.product_id
    LIMIT ? OFFSET ?;
    `;
    db.query(selectQuery, [parseInt(limit), parseInt(offset)], (err, result) => {
        if(err) {
            output({ error: { description: err.message}}, null);
        } else {
            output(null, result)
        }
    })
}

module.exports = {addNewPurchaseService, getPurchaseDetailService}