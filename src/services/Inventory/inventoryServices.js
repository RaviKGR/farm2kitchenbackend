const { db } = require("../../confic/db");

const updateInventoryService = async (input, output) => {
  const {
    inventoryId,
    quantityInStock,
    price,
    reorderLevel,
    discountPercentage,
  } = input;
  const updateQuery = `UPDATE inventory SET quantity_in_stock = ?, price = ?, reorder_level = ? , discount_percentage = ? WHERE inventory_id = ?`;
  db.query(
    updateQuery,
    [quantityInStock, price, reorderLevel, discountPercentage, inventoryId],
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
  const { limit, offset, categoryId, productName } = input;
  let whereClause = "WHERE 1=1";
  const queryParams = [];

  if (categoryId) {
    whereClause += " AND p.category_id = ?";
    queryParams.push(categoryId);
  }

  if (productName) {
    whereClause += " AND p.name LIKE ?";
    queryParams.push(`%${productName}%`);
  }
  const getQuery = `
    SELECT
  COUNT(*) OVER() AS total_count, 
  I.inventory_id,
  C.category_id, 
  C.name AS category_name,  
  P.product_id,
  P.name AS product_name,  
  P.brand,
  PV.variant_id,
  PV.description,
  PV.size,
  PV.type,
  PV.barcode,
  I.quantity_in_stock,
  I.price,
  I.reorder_level,
  I.discount_percentage,
  PC.category_id AS parent_category_id, 
  PC.name AS parent_category_name       
FROM inventory I
JOIN productvariant PV ON PV.variant_id = I.variant_id
JOIN product P ON P.product_id = PV.product_id
JOIN category C ON C.category_id = P.category_id
LEFT JOIN category PC ON C.parent_category_id = PC.category_id
${whereClause}
LIMIT ? OFFSET ?;
`;
queryParams.push(parseInt(limit), parseInt(offset));
  db.query(getQuery, [...queryParams], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      // const results = result.map((i) => ({
      //   ...i,
      //   product_name: `${i.product_name}(${i.size}${i.type})`,
      // }));
      output(null, result);
    }
  });
};

module.exports = { updateInventoryService, getInventoryService };
