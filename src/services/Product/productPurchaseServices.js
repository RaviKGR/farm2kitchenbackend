const { db } = require("../../confic/db");

const addNewPurchaseService = async (input, output) => {
  const { variantId, quantity, purchasePrice, HST, purchaseDate, vendor } = input;
  const insertQuery = `INSERT INTO productPurchase (variant_id,vendor, quantity_in_stock, purchase_price, HST, purchase_date) VALUES (?, ?, ?,?, ?, ?)`;
  db.query(
    insertQuery,
    [variantId, vendor, quantity, purchasePrice, HST, purchaseDate],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Purchase details inserted successfully" });
      }
    }
  );
};

const getPurchaseDetailService = async (input, output) => {
  const { limit, offset, productName, brand, purchaseDate } = input;

  let whereClause = "";
  const queryParams = [];

  const hasConditions = productName || brand || purchaseDate;

  if (hasConditions) {
    if (productName) {
      whereClause += "p.name LIKE ? ";
      queryParams.push(`%${productName}%`);
    }

    if (brand) {
      whereClause += (whereClause ? "AND " : "") + "p.brand LIKE ? ";
      queryParams.push(`%${brand}%`);
    }

    if (purchaseDate) {
      whereClause += (whereClause ? "AND " : "") + "pp.purchase_date = ? ";
      queryParams.push(purchaseDate);
    }
  }

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
        p.brand,
        pv.size,
        pv.type
    FROM productPurchase pp
    JOIN productvariant pv ON pv.variant_id = pp.variant_id
    LEFT JOIN product p ON p.product_id = pv.product_id
    ${hasConditions ? `WHERE ${whereClause}` : ""}
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
        purchase_price: list.purchase_price,
        quantity_in_stock: list.quantity_in_stock,
        HST: list.HST,
        purchase_date: list.purchase_date,
        product_id: list.product_id,
        name: `${list.name} (${list.size}${list.type})`,
        brand: list.brand,
        size: list.size,
        type: list.type
      }))
      output(null, productPurchase);
    }
  });
};

module.exports = { addNewPurchaseService, getPurchaseDetailService };
