const { db } = require("../../confic/db");

const AddCartService = async () => {

}

const getCartService = async () => {
    return new Promise((resolve, reject) => {
        const getCartQuery = `
            SELECT 
                p.product_id,
                p.name AS product_name,
                pv.variant_id,
                pv.description AS variant_description,
                pv.size,
                pv.type,
                i.quantity_in_stock,
                i.price,
                CASE 
                    WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM 
                Product p
            INNER JOIN 
                productVariant pv ON p.product_id = pv.product_id
            INNER JOIN 
                Inventory i ON pv.variant_id = i.variant_id
        `;

        db.query(getCartQuery, (err, result) => {
            if (err) {
                console.error('Database error in getCartService:', err);
                reject(new Error('Failed to retrieve cart data from database'));
            } else {
                
                resolve(result);
            }
        });
    });
};


module.exports = { AddCartService, getCartService };