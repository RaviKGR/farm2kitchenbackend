const { db } = require("../../confic/db");

const AddCartService = async (input, output) => {
    const productId = input.productId;
    const inventorystock = `UPDATE Inventory 
SET quantity_in_stock = ? 
WHERE variant_id = ?;
`;
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

        db.query(getCartQuery, (err, cartResult) => {
            if (err) {
                console.error('Database error in getCartService (cart data):', err);
                return reject(new Error('Failed to retrieve cart data from database'));
            }

            const getOfferQuery = `
                        SELECT 
                            o.offer_id,
                            o.name AS offer_name,
                            o.description AS offer_description,
                            o.discountType,
                            o.discountValue,
                            o.start_date,
                            o.end_date,
                            od.offer_tag,
                            od.tag_id
                        FROM 
                            Offer o
                        JOIN 
                            Offer_Details od ON o.offer_id = od.offer_id 
                        AND o.deleted = 'n'  
                        AND CURDATE() BETWEEN o.start_date AND o.end_date
                    `;


            db.query(getOfferQuery, [offerId], (err, offerResult) => {
                if (err) {
                    console.error('Database error in getCartService (offer data):', err);
                    return reject(new Error('Failed to retrieve offer data from database'));
                }
                console.log(!offerResult.length)
                // If no valid offer is found, handle gracefully
                if (!offerResult.length) {
                    return resolve(cartResult); // No offer, return the original cart
                }

                const offerTagId = offerResult[0].tag_id;
                const offerTagType = offerResult[0].offer_tag || ''; // Ensure it's a valid string
                const discountType = offerResult[0].discountType;
                let filteredCartData = [];
                let noOfferCartData = [];

                if (offerTagType.toLowerCase() === 'product') {
                    filteredCartData = cartResult.filter(product => product.product_id === offerTagId);
                    noOfferCartData = cartResult.filter(product => product.product_id !== offerTagId);
                } else if (offerTagType.toLowerCase() === 'category') {
                    filteredCartData = cartResult.filter(product => product.category_id === offerTagId);
                    noOfferCartData = cartResult.filter(product => product.product_id !== offerTagId);
                }

                if (discountType.toLowerCase() === 'flat') {
                    const discountValue = parseFloat(offerResult[0].discountValue);
                    filteredCartData = filteredCartData.map(product => {
                        const originalPrice = parseFloat(product.price);
                        const discountedPrice = Math.max(0, originalPrice - discountValue);
                        return {
                            ...product,
                            discountValue,
                            originalPrice,
                            price: discountedPrice.toFixed(2)
                        };
                    });
                }

                if (discountType.toLowerCase() === 'percentage') {
                    const discountValue = parseFloat(offerResult[0].discountValue);
                    filteredCartData = filteredCartData.map(product => {
                        const originalPrice = parseFloat(product.price);
                        const discountAmount = (originalPrice * discountValue) / 100;
                        const discountedPrice = Math.max(0, originalPrice - discountAmount);
                        return {
                            ...product,
                            discountAmount,
                            originalPrice,
                            price: discountedPrice.toFixed(2)
                        };
                    });
                }

                const result = [...filteredCartData, ...noOfferCartData];
                resolve(result);
            });
        });
    });
};




module.exports = { AddCartService, getCartService };