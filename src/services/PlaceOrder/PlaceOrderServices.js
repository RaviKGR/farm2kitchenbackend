const CreatePlaceOrder = async (input, output) => {
    const { userId, productId, variantId, price, quantity, totalAmount, orderStatus } = input;

    // SQL query to check if the product variant is available in stock
    const checkStockQuery = `
        SELECT quantity_in_stock 
        FROM Inventory 
        WHERE variant_id = ? 
        AND quantity_in_stock >= ?
    `;

    db.query(checkStockQuery, [variantId, quantity], (err, results) => {
        if (err) {
            output.status(500).send({ message: "Error checking inventory" });
            return;
        }

        if (results.length === 0) {
            // No stock available
            output.status(400).send({ message: "Product not available in the required quantity" });
        } else {
            // If stock is available, update the inventory
            const updateStockQuery = `
                UPDATE Inventory 
                SET quantity_in_stock = quantity_in_stock - ? 
                WHERE variant_id = ?
            `;

            db.query(updateStockQuery, [quantity, variantId], (err, updateResult) => {
                if (err) {
                    output.status(500).send({ message: "Error updating inventory" });
                    return;
                }

                // Insert the order into the Orders table
                const insertOrderQuery = `
                    INSERT INTO Orders (user_id, total_amount, order_status) 
                    VALUES (?, ?, ?)
                `;

                db.query(insertOrderQuery, [userId, totalAmount, orderStatus], (err, orderResult) => {
                    if (err) {
                        output.status(500).send({ message: "Error placing order" });
                        return;
                    }

                    // Get the newly inserted order ID
                    const orderId = orderResult.insertId;

                    // Insert into OrderItem with the orderId and product details
                    const insertOrderItemQuery = `
                        INSERT INTO OrderItem (order_id, product_id, quantity, price_at_purchase) 
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(insertOrderItemQuery, [orderId, productId, quantity, price], (err, orderItemResult) => {
                        if (err) {
                            output.status(500).send({ message: "Error adding order items" });
                            return;
                        }

                        // Order placed and items added successfully
                        output.status(200).send({ message: "Order placed successfully" });
                    });
                });
            });
        }
    });
};

module.exports = { CreatePlaceOrder };
