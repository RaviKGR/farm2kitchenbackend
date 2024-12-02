const { db } = require("../../confic/db");

const addNewOfferServer = async (input, output) => {
  try {
    const {
      offerName,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      isPrimary,
      items,
      imageTag,
    } = input;
    const image = `/uploads/${input.image}`;

    // Insert the offer into the offer table
    const insertOfferQuery = `INSERT INTO offer (name, description, discountType, discountValue, start_date, end_date, deleted) VALUES (?, ?, ?, ?, ?, ?, "N")`;
    const [offerResult] = await db
      .promise()
      .query(insertOfferQuery, [
        offerName,
        description,
        discountType,
        discountValue,
        startDate,
        endDate,
      ]);

    if (offerResult.affectedRows > 0) {
      const lastOfferId = offerResult.insertId;

      // Insert the image into the productimage table
      const insertImageQuery = `INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) VALUES (?, ?, ?, ?, ?)`;
      await db
        .promise()
        .query(insertImageQuery, [
          lastOfferId,
          image,
          imageTag,
          offerName,
          isPrimary,
        ]);

      // Insert offer details (loop over items)
      const insertItemsPromises = items.map((list) => {
        const insertItemsQuery = `INSERT INTO offer_details (offer_id, offer_tag, tag_id) VALUES (?, ?, ?)`;
        return db
          .promise()
          .query(insertItemsQuery, [lastOfferId, list.offerTag, list.tagId]);
      });

      const OfferResults = await Promise.all(insertItemsPromises);

      if (OfferResults.some((result) => result[0].affectedRows === 0)) {
        return {
          success: false,
          status: 500,
          message: "Failed to place order.",
        };
      } else {
        return {
          success: true,
          status: 201,
          message: "Order placed successfully.",
        };
      }
    } else {
      return {
        success: false,
        status: 500,
        message: "Failed to insert offer.",
      };
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "DataBase Error" };
  }
};

const getOfferService = async (input, output) => {
  const { limit, offset, offerName, startDate, endDate, status } = input;

  let whereClause = "off.deleted = 'N' ";
  const queryParams = [];
  const hasConditions = offerName || startDate || endDate || status;

  if (hasConditions) {
    if (offerName) {
      whereClause += "AND off.name LIKE ? ";
      queryParams.push(`%${offerName}%`);
    }

    if (startDate && endDate) {
      whereClause += "AND off.start_date <= ? AND off.end_date >= ?";
      queryParams.push(startDate, endDate);
    }
    if (startDate && endDate) {
      whereClause += "AND off.start_date <= ? AND off.end_date >= ?";
      queryParams.push(startDate, endDate);
    }
  }

  const getOfferQuery = `
    SELECT
    COUNT(off.offer_id) OVER() AS total_count,
    off.offer_id,
    off.name,
    off.description,
    off.discountType,
    off.discountValue,
    off.start_date,
    off.end_date
    FROM offer off
    WHERE ${whereClause}
    LIMIT ? OFFSET ?`;

  queryParams.push(parseInt(limit), parseInt(offset));
  db.query(getOfferQuery, [...queryParams], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      console.log("result", result);
      const currentDate = new Date();

      const updatedResult = result.map((offer) => {
        const endDate = new Date(offer.end_date);

        return {
          ...offer,
          status: endDate < currentDate ? "EXPIRED" : "ACTIVE",
        };
      });

      output(null, updatedResult);
    }
  });
};

const updateOfferService = async (input, output) => {
  const { offerId, offerName, description, discountValue, startDate, endDate } =
    input;
  // const offerTag = input.offerTag.toUpperCase();
  const updateOfferQuery = `
    UPDATE offer SET name = ?, description = ?, discountValue = ?, start_date = ?, end_date = ? WHERE offer_id = ?;
    `;
  // const updateOfferQuery = `
  //   UPDATE offer SET name = ?, description = ?, discountType = ?, discountValue = ?, start_date = ?, end_date = ? WHERE offer_id = ?;
  //   UPDATE offer_details SET offer_tag = ?, tag_id = ? WHERE id = ? AND offer_id = ?;
  //   `;
  db.query(
    updateOfferQuery,
    [offerName, description, discountValue, startDate, endDate, offerId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Offer updated Successfully" });
      }
    }
  );
};

const deleteOfferService = async (offerId, output) => {
  const deleteQuery = `UPDATE offer SET deleted = "Y" WHERE offer_id = ?;`;
  db.query(deleteQuery, [offerId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "Offer Deleted Successfully" });
    }
  });
};

// customer

const getAllOffersService = async () => {
  const getOfferQuery = `
  SELECT
  off.offer_id,
  off.name,
  off.description,
  off.discountType,
  off.discountValue,
  off.start_date,
  off.end_date,
  od.id,
  od.offer_tag,
  od.tag_id,
  pi.*
  FROM offer off
  JOIN productimage pi ON pi.image_id = off.offer_id
  JOIN offer_details od
  ON off.offer_id = od.offer_id
  WHERE off.deleted = "N" AND pi.image_tag IN ('offer' , 'OFFER')`;
  const [result] = await db.promise().query(getOfferQuery);
  if (result.length > 0) {
    return result;
  } else {
    return [];
  }
};
const getCategoryOfferService = async () => {
  try {
    const getOfferQuery = `
  SELECT
  off.offer_id,
  off.name,
  off.description,
  off.discountType,
  off.discountValue,
  off.start_date,
  off.end_date,
  od.id,
  od.offer_tag,
  od.tag_id,
  pi.*
  FROM offer off
  JOIN productimage pi ON pi.image_id = off.offer_id
  JOIN offer_details od
  ON off.offer_id = od.offer_id
  WHERE od.offer_tag IN ('category', 'CATEGORY') AND off.deleted = "N" AND pi.image_tag IN ('offer' , 'OFFER')`;
    const [result] = await db.promise().query(getOfferQuery);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

const getCategoryProductByOfferService = async (input) => {
  try {
    // Query to get offers with specified tags
    const getOfferQuery = `
      SELECT
        off.offer_id,
        off.name AS offer_name,
        off.discountType,
        off.discountValue,
        od.id,
        od.offer_tag,
        od.tag_id,
        c.name AS category_name
      FROM offer off
      JOIN offer_details od ON od.offer_id = off.offer_id
      JOIN category c ON c.category_id = od.tag_id
      WHERE od.offer_tag IN ('category', 'CATEGORY') AND off.deleted = "N"
      LIMIT 5 OFFSET 0
    `;

    const [offerResult] = await db.promise().query(getOfferQuery);

    if (offerResult.length > 0) {
      const mainResult = await Promise.all(
        offerResult.map(async (offer) => {
          // Query to get products for each category
          const getProductsQuery = `
            SELECT
              p.product_id, 
              p.name AS productName, 
              p.brand AS brandName,
              p.category_id,
              pi.id AS imageId,
              pi.image_url,
              pi.alt_text,
              pi.is_primary,
              i.price,
              i.discount_percentage
            FROM product p
            JOIN productvariant pv ON pv.product_id = p.product_id
            JOIN productimage pi ON pi.image_id = pv.variant_id
            JOIN inventory i ON i.inventory_id = pv.variant_id
            WHERE p.category_id = ? 
            AND pv.is_primary = 'Y'
            AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
            AND pi.is_primary = 'Y'
            AND i.price IS NOT NULL;
          `;

          const [productResult] = await db.promise().query(getProductsQuery, [offer.tag_id]);
          const productsWithDiscount = productResult.map((product) => {
            const price = parseFloat(product.price);
            let discountedPrice = price;

            if (offer.discountType.toLowerCase() === 'flat') {
              discountedPrice = Math.max(price - parseFloat(offer.discountValue), 0);
            } else if (offer.discountType.toLowerCase() === 'percentage') {
              discountedPrice = price - (price * parseFloat(offer.discountValue)) / 100;
            }
            return {
              ...product,
              discountedPrice: discountedPrice.toFixed(2),
            };
          });
          return {
            offer_id: offer.offer_id,
            offer_name: offer.offer_name,
            discountType: offer.discountType,
            discountValue: offer.discountValue, 
            category_id: offer.tag_id,
            category_name: offer.category_name,
            products: productsWithDiscount,
          };
        })
      );

      return mainResult;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 400, message: 'Database Error' };
  }
};




module.exports = {
  addNewOfferServer,
  getOfferService,
  updateOfferService,
  deleteOfferService,
  getAllOffersService,
  getCategoryOfferService,
  getCategoryProductByOfferService,
};
