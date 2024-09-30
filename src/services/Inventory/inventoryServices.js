const { db } = require("../../confic/db");

const updateInventoryService = async (input, output) => {
  const { inventoryId, quantityInStock, price, discountPercentage } = input;
  const updateQuery = `UPDATE inventory SET quantity_in_stock = ?, price = ?, discount_percentage = ? WHERE inventory_id = ?`;
  db.query(
    updateQuery,
    [quantityInStock, price, discountPercentage, inventoryId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Inventory updated successfully" });
      }
    }
  );
};

const getInventoryService = async (input, output) => {
    const {limit, offset} = input
    const Limit = parseInt(limit);
    const OffSet = parseInt(offset);
    const getQuery = `
    SELECT 
      I.inventory_id,
      C.category_id, 
      C.name AS category_name,  
      P.product_id,
      P.name AS product_name,  
      P.brand,
      PV.variant_id,
      PV.description,
      PV.size,
      PV.purchase_price,
      PV.HST,
      PV.barcode,
      I.quantity_in_stock,
      I.price,
      I.discount_percentage
    FROM inventory I
    JOIN productvariant PV ON PV.variant_id = I.variant_id
    JOIN product P ON P.product_id = PV.product_id
    JOIN category C ON C.category_id = P.category_id 
    LIMIT ? OFFSET ?`;
  db.query(getQuery, [Limit, OffSet], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

module.exports = { updateInventoryService, getInventoryService };
