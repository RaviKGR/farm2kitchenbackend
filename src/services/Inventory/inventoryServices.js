const { db } = require("../../confic/db");

const updateInventoryService = async (input, output) => {
  const {
    inventoryId,
    quantityInStock,
    price,
    reorderLevel,
    discountPercentage,
  } = input;
  try {
    const updateQuery = `UPDATE inventory SET quantity_in_stock = ?, price = ?, reorder_level = ? , discount_percentage = ? WHERE inventory_id = ?`;
    const [inventoryResult] = await db
      .promise()
      .query(updateQuery, [
        quantityInStock,
        price,
        reorderLevel,
        discountPercentage,
        inventoryId,
      ]);
    if (inventoryResult.affectedRows > 0) {
      const selectInventory = `SELECT * FROM inventory WHERE inventory_id = ?`;
      const [getInventoryResult] = await db
        .promise()
        .query(selectInventory, [inventoryId]);
      if (getInventoryResult.length > 0) {
        const GetPrice = `SELECT * FROM price_history WHERE variant_id = ?`;
        const [getResultPrice] = await db
          .promise()
          .query(GetPrice, [getInventoryResult[0].variant_id]);
        if (getResultPrice.length > 0) {
          const updatePrice = `UPDATE price_history SET new_price = ? , old_price = ? WHERE variant_id = ?`;
          const [updateResult] = await db
            .promise()
            .query(updatePrice, [
              price,
              getResultPrice[0].new_price,
              getResultPrice[0].variant_id,
            ]);
          if (updateResult.affectedRows > 0) {
            return {
              success: true,
              status: 200,
              message: "updated successfully",
            };
          } else {
            return { success: false, status: 400, message: "unable to update" };
          }
        } else {
          const insertQuery = `INSERT INTO price_history (old_price, new_price, variant_id) VALUES (?, ?, ?)`;
          const [result] = await db
            .promise()
            .query(insertQuery, [price, price, getInventoryResult[0].variant_id]);
          if (result.affectedRows > 0) {
            return {
              success: true,
              status: 200,
              message: "updated successfully",
            };
          } else {
            return { success: false, status: 400, message: "unable to update" };
          }
        }
        return getResultPrice;
      } else {
        return [];
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

const getInventoryService = async (input, output) => {
  const { limit, offset, categoryId, productName, parentCategoryId } = input;
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

  if (parentCategoryId) {
    whereClause += " AND C.parent_category_id = ?";
    queryParams.push(parentCategoryId);
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
