const { formatDateToTimeZone } = require("../../confic/dateAndTimeZone");
const { db } = require("../../confic/db");

const addNewPurchaseService = async (input, output) => {
  const { variantId, quantity, purchasePrice, HST, purchaseDate, vendor } =
    input;
  const insertQuery = `INSERT INTO productPurchase (variant_id, vendor, quantity_in_stock, purchase_price, HST, purchase_date, deleted) VALUES (?, ?, ?, ?, ?, ?, "N")`;
  db.query(
    insertQuery,
    [variantId, vendor, Number(quantity), purchasePrice, HST, purchaseDate],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        const selectQuery = `SELECT variant_id, inventory_id, quantity_in_stock FROM inventory WHERE variant_id = ?`;
        db.query(selectQuery, [variantId], (err, result) => {
          if (err) {
            output({ error: { description: err.message } }, null);
          } else {
            const inventoryId = result[0].inventory_id;
            const Quantity =
              (result[0].quantity_in_stock ?? 0) + Number(quantity);

            const insertQuery = `UPDATE inventory SET quantity_in_stock = ? WHERE inventory_id = ?`;
            db.query(insertQuery, [Quantity, inventoryId], (err, results) => {
              if (err) {
                output({ error: { description: err.message } }, null);
              } else {
                output(null, {
                  message: "Purchase details inserted successfully",
                });
              }
            });
          }
        });
      }
    }
  );
};

const getPurchaseDetailService = async (input, output) => {
  const { limit, offset, productName, brand, purchaseDate } = input;

  let whereClause = "pp.deleted = 'N'";
  const queryParams = [];

  if (productName) {
    whereClause += " AND p.name LIKE ? ";
    queryParams.push(`%${productName}%`);
}

if (brand) {
    whereClause += " AND p.brand LIKE ? ";
    queryParams.push(`%${brand}%`);
}

if (purchaseDate) {
    whereClause += " AND pp.purchase_date = ? ";
    queryParams.push(purchaseDate);
}

  const selectQuery = `
    SELECT
        COUNT(*) OVER() AS total_count,
        pp.variant_id,
        pp.purchase_id,
        pp.vendor,
        pp.purchase_price,
        pp.quantity_in_stock,
        pp.HST,
        pp.purchase_date,
        p.product_id,
        p.name,
        p.brand,
        pv.size,
        pv.type
    FROM productPurchase pp
    JOIN productvariant pv ON pv.variant_id = pp.variant_id
    LEFT JOIN product p ON p.product_id = pv.product_id
    WHERE ${whereClause}
    LIMIT ? OFFSET ?;
    `;
  queryParams.push(parseInt(limit), parseInt(offset));

  db.query(selectQuery, [...queryParams], (err, result) => {
    
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const productPurchase = result.map((list) => ({
        total_count: list.total_count,
        variant_id: list.variant_id,
        purchase_id: list.purchase_id,
        vendor: list.vendor,
        purchase_price: list.purchase_price,
        quantity_in_stock: list.quantity_in_stock,
        HST: list.HST,
        purchase_date: formatDateToTimeZone(list.purchase_date),
        product_id: list.product_id,
        name: `${list.name} (${list.size}${list.type})`,
        brand: list.brand,
        size: list.size,
        type: list.type,
      }));
      output(null, productPurchase);
    }
  });
};

const deletePurchaseProductService = async (purchaseId) => {
  try {
    const selectPurchase = `SELECT * FROM productpurchase WHERE purchase_id = ?`;
    const [purchaseResult] = await db
      .promise()
      .query(selectPurchase, [purchaseId]);
    if (purchaseResult.length > 0) {
      const purchaseQuantity = purchaseResult[0].quantity_in_stock;
      const variantId = purchaseResult[0].variant_id;

      const selectInventory = `SELECT * FROM inventory WHERE variant_id = ?`;
      const [inventoryResult] = await db
        .promise()
        .query(selectInventory, [variantId]);
      if (inventoryResult.length > 0) {
        const inventoryQuantity = inventoryResult[0].quantity_in_stock;
        if (purchaseQuantity <= inventoryQuantity) {
          const updateQuery = `UPDATE productpurchase SET deleted = "Y" WHERE purchase_id = ?`;
          const [result] = await db.promise().query(updateQuery, [purchaseId]);
          if (result.affectedRows > 0) {
            const updateQuery = `UPDATE inventory SET quantity_in_stock = ? WHERE variant_id = ?`;
            const [inventoryUpdate] = await db
              .promise()
              .query(updateQuery, [
                inventoryQuantity - purchaseQuantity,
                variantId,
              ]);
            if (inventoryUpdate.affectedRows > 0) {
              return {
                success: true,
                message: "Purchase product deleted successfullf",
              };
            }
          }
          return {
                  success: true,
                  message: "Purchase product deleted successfullf",
                };
        } else {
          return { success: false, message: "Unable to delete" };
        }
      }
    } else {
      return { success: false, message: "purchase product not found" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

module.exports = {
  addNewPurchaseService,
  getPurchaseDetailService,
  deletePurchaseProductService,
};
