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
  const { limit, offset } = input;
  const getOfferQuery = `
    SELECT
    COUNT(off.offer_id) OVER() AS total_count,
    off.offer_id,
    off.description,
    off.discountType,
    off.discountValue,
    off.start_date,
    off.end_date,
    od.id,
    od.offer_tag,
    od.tag_id
    FROM offer off
    JOIN offer_details od
    ON off.offer_id = od.offer_id
    WHERE off.deleted = "N"
    LIMIT ? OFFSET ?`;
  db.query(
    getOfferQuery,
    [parseInt(limit), parseInt(offset)],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, result);
      }
    }
  );
};

const updateOfferService = async (input, output) => {
  const {
    offerId,
    offerName,
    description,
    discountType,
    discountValue,
    startDate,
    endDate,
    id,
    tagId,
  } = input;
  const offerTag = input.offerTag.toUpperCase();
  const updateOfferQuery = `
    UPDATE offer SET name = ?, description = ?, discountType = ?, discountValue = ?, start_date = ?, end_date = ? WHERE offer_id = ?;
    UPDATE offer_details SET offer_tag = ?, tag_id = ? WHERE id = ? AND offer_id = ?;
    `;
  db.query(
    updateOfferQuery,
    [
      offerName,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      offerId,
      offerTag,
      tagId,
      id,
      offerId,
    ],
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

module.exports = {
  addNewOfferServer,
  getOfferService,
  updateOfferService,
  deleteOfferService,
};
