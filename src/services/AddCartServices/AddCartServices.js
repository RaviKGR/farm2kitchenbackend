const { db } = require("../../confic/db");

const AddCartService = async () => {

}

// const getCartService = async () => {
//     return new Promise((resolve, reject) => {
//         const getCartQuery = `
//         SELECT 
//             p.product_id,
//             p.name AS product_name,
//             pv.variant_id,
//             pv.description AS variant_description,
//             pv.size,
//             pv.type,
//             i.quantity_in_stock,
//             i.price,
//             CASE 
//                 WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
//                 ELSE 'In Stock'
//             END AS stock_status,
//             pi.image_url,
//             pi.alt_text,
//             pi.is_primary,
//             c.category_id,
//             c.name AS category_name,
//             c.description AS category_description
//         FROM 
//             Product p
//         INNER JOIN 
//             productVariant pv ON p.product_id = pv.product_id
//         INNER JOIN 
//             Inventory i ON pv.variant_id = i.variant_id
//         LEFT JOIN
//             ProductImage pi ON pi.image_id = pv.variant_id
//         LEFT JOIN
//             Category c ON p.category_id = c.category_id
//     `;
//         db.query(getCartQuery, (err, result) => {
//             if (err) {
//                 console.error('Database error in getOfferTable:', err);
//                 reject(new Error('Failed to retrieve cart data from database'));
//             } else {
//                 const getofferquery = `SELECT 
//                         o.offer_id,
//                         o.name AS offer_name,
//                         o.description AS offer_description,
//                         o.discountType,
//                         o.discountValue,
//                         od.offer_tag,
//                         od.tag_id
//                     FROM 
//                        Offer o
//                     JOIN 
//                        Offer_Details od ON o.offer_id = od.offer_id
//                     WHERE 
//                        o.offer_id = ?; -- Replace ? with the specific offer_id you want to check`
//                 db.query(getofferquery, (err, result) => {
//                     if (err) {
//                         console.error('Database error in getCartService:', err);
//                         reject(new Error('Failed to retrieve cart data from database'));
//                     }
//                     else {
//                         console.log(result);

//                         return result;
//                     }
//                 })
//                 resolve(result);
//             }
//         });
//     });
// };
const getCartService = async (offerId) => {
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
            END AS stock_status,
            pi.image_url,
            pi.alt_text,
            pi.is_primary,
            c.category_id,
            c.name AS category_name,
            c.description AS category_description
        FROM 
            Product p
        INNER JOIN 
            productVariant pv ON p.product_id = pv.product_id
        INNER JOIN 
            Inventory i ON pv.variant_id = i.variant_id
        LEFT JOIN
            ProductImage pi ON pi.image_id = pv.variant_id
        LEFT JOIN
            Category c ON p.category_id = c.category_id;
    `;
        // First query: Get cart data
        db.query(getCartQuery, (err, cartResult) => {
            if (err) {
                console.error('Database error in getCartService (cart data):', err);
                return reject(new Error('Failed to retrieve cart data from database'));
            }

            // Second query: Get offer data
            const getOfferQuery = `
                SELECT 
                    o.offer_id,
                    o.name AS offer_name,
                    o.description AS offer_description,
                    o.discountType,
                    o.discountValue,
                    od.offer_tag,
                    od.tag_id
                FROM 
                    Offer o
                JOIN 
                    Offer_Details od ON o.offer_id = od.offer_id
            `;

            db.query(getOfferQuery, [offerId], (err, offerResult) => {
                if (err) {
                    console.error('Database error in getCartService (offer data):', err);
                    return reject(new Error('Failed to retrieve offer data from database'));
                }
                const offerTagId = offerResult.length ? offerResult[0].tag_id : null;
                const offerTagType = offerResult.length ? offerResult[0].offer_tag : null; // e.g., 'product' or 'category'
                const discountType = offerResult.length ? offerResult[0].discountType : null;
                let filteredCartData = [];
                console.log(discountType);

                if (offerTagType.toLowerCase() === 'product') {
                    // If the offer is for a specific product, filter by product_id
                    filteredCartData = cartResult.filter(product => product.product_id === offerTagId);
                } else if (offerTagType.toLowerLase() === 'category') {
                    // If the offer is for a specific category, filter by category_id
                    filteredCartData = cartResult.filter(product => product.category_id === offerTagId);
                }


                if (discountType.toLowerCase() === 'flat') {
                    const discountValue = parseFloat(offerResult[0].discountValue); // Assuming discountValue is stored as a string

                    filteredCartData = filteredCartData.map(product => {
                        const originalPrice = parseFloat(product.price); // Convert product price to a number
                        const discountedPrice = Math.max(0, originalPrice - discountValue); // Ensure price doesn't go below 0

                        return {
                            ...product,
                            discountValue, // Keep all existing properties of the product
                            originalPrice, // Store original price (optional)
                            price: discountedPrice.toFixed(2) // Update the price with the discounted value
                        };
                    });
                }



                if (discountType.toLowerCase() === 'percentage') {
                    const discountValue = parseFloat(offerResult[0].discountValue); // Discount percentage value (e.g., 10 for 10%)

                    filteredCartData = filteredCartData.map(product => {
                        const originalPrice = parseFloat(product.price); // Convert product price to a number
                        const discountAmount = (originalPrice * discountValue) / 100; // Calculate the discount amount
                        const discountedPrice = Math.max(0, originalPrice - discountAmount); // Ensure price doesn't go below 0
                        return {
                            ...product,
                            discountAmount, // Keep all existing properties of the product
                            originalPrice, // Store original price (optional)
                            price: discountedPrice.toFixed(2) // Update the price with the discounted value
                        };
                    });
                }

                console.log(filteredCartData);


                // Combine both results
                const result = {
                    cartData: filteredCartData,
                    // offerData: offerResult
                };

                resolve(result);
            });
        });
    });
};



module.exports = { AddCartService, getCartService };