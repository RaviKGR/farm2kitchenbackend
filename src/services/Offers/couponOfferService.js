const { db } = require("../../confic/db");

const addNewCouponService = async (input, output) => {
  const {
    userId,
    couponCode,
    name,
    description,
    couponType,
    couponValue,
    maxDiscountAmt,
    minAmount,
    startDate,
    endDate,
  } = input;
  //   const couponTag = input.couponTag.toUpperCase();
  const insertQuery = `INSERT INTO coupon (user_id, coupon_code, name, description, coupon_type, coupon_value, max_discount_amt, min_amount, start_date, end_date, coupon_applied, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "N", "N")`;
  db.query(
    insertQuery,
    [
      userId,
      couponCode,
      name,
      description,
      couponType,
      couponValue,
      maxDiscountAmt,
      minAmount,
      startDate,
      endDate,
    ],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "coupon created Successfully" });
      }
    }
  );
};

const getCouponOfferService = async (input, output) => {
  const { limit, offset, CouponName, startDate, endDate } = input;

  let whereClause = "c.deleted = 'N' ";
  const queryParams = [];
  const hasConditions = CouponName || startDate || endDate

  if (hasConditions) {
    if (CouponName) {
      whereClause += "AND c.name LIKE ? ";
      queryParams.push(`%${CouponName}%`)
    }

    if (startDate && endDate) {
      whereClause += "AND c.start_date <= ? AND c.end_date >= ?";
      queryParams.push(startDate, endDate);
    }
  }
  const getOfferQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
    u.name AS customer_name,
    c.coupon_code,
    c.name AS coupon_name,
    c.description,
    c.coupon_type,
    c.coupon_value,
    c.max_discount_amt,
    c.min_amount,
    c.start_date,
    c.end_date
    FROM coupon c
    JOIN users u ON u.user_id = c.user_id
    WHERE ${whereClause}    
    LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset))
  db.query(
    getOfferQuery,
    [...queryParams],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, result);
      }
    }
  );
};

const getCouponOfferByIdService = async (couponId, output) => {
  const getOfferQuery = `
    SELECT
    u.name AS customer_name,
    c.coupon_id,
    c.coupon_code,
    c.name AS coupon_name,
    c.description,
    c.coupon_type,
    c.coupon_value,
    c.max_discount_amt,
    c.min_amount,
    c.start_date,
    c.end_date
    FROM coupon c
    JOIN users u ON u.user_id = c.user_id    
    WHERE c.coupon_id = ? AND deleted = "N"`;
  db.query(getOfferQuery, [couponId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getCouponOfferByUserIdService = async (input, output) => {
  const { userId, limit, offset } = input;
  const getOfferQuery = `
    SELECT
    u.name AS customer_name,
    c.coupon_id,
    c.coupon_code,
    c.name AS coupon_name,
    c.description,
    c.coupon_type,
    c.coupon_value,
    c.max_discount_amt,
    c.min_amount,
    c.start_date,
    c.end_date
    FROM coupon c
    JOIN users u ON u.user_id = c.user_id    
    WHERE c.user_id = ? AND deleted = "N"
    LIMIT ? OFFSET ?`;
  db.query(
    getOfferQuery,
    [userId, parseInt(limit), parseInt(offset)],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, result);
      }
    }
  );
};

const updateCouponOfferService = async (input, output) => {
  const { couponId, couponValue, startDate, endDate } = input;
  const updateQuery = `UPDATE coupon SET coupon_value = ?, start_date = ?, end_date = ? WHERE coupon_id = ?`;
  db.query(
    updateQuery,
    [couponValue, startDate, endDate, couponId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Coupon offer updated successfully" });
      }
    }
  );
};

const deleteCouponOfferService = async (couponId, output) => {
  const updateQuery = `UPDATE coupon SET deleted = "Y" WHERE coupon_id = ?`;
  db.query(updateQuery, [couponId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "Coupon offer Deleted successfully" });
    }
  });
};

const ApplyCouponOfferService = async (input) => {
  const { couponCode, totalcouponAmount } = input;
  const currentDate = new Date();
  const checkQuery = `
    SELECT * FROM coupon 
    WHERE coupon_code = ? 
      AND start_date <= ? 
      AND end_date >= ? 
      AND deleted = 'N' 
  `;

  try {
    const [result] = await db.promise().query(checkQuery, [couponCode, currentDate, currentDate]);

    if (result.length === 0) {
      throw new Error("Invalid coupon code or expired offer");
    }

    const coupon = result[0];
    let discountAmount = 0;
    let discountMessage = '';
    let finalAmount = totalcouponAmount;

    if (coupon.coupon_type === 'Flat') {
      discountAmount = coupon.coupon_value;

      if (totalcouponAmount < coupon.min_amount) {
        throw new Error(`Minimum amount of ${coupon.min_amount} is required`);
      }

      discountMessage = `Flat discount applied: ${discountAmount}`;
      finalAmount = totalcouponAmount - discountAmount;

    } else if (coupon.coupon_type === 'Percentage') {
      discountAmount = (totalcouponAmount * coupon.coupon_value) / 100;

      if (discountAmount > coupon.max_discount_amt) {
        discountAmount = coupon.max_discount_amt;
      }

      if (totalcouponAmount < coupon.min_amount) {
        throw new Error(`Minimum amount of ${coupon.min_amount} is required`);
      }

      discountMessage = `Percentage discount applied: ${coupon.coupon_value}% off, Discount Amount: ${discountAmount}`;
      finalAmount = totalcouponAmount - discountAmount;

    } else {
      throw new Error("Invalid coupon type");
    }

    return {
      message: discountMessage,
      discountAmount: discountAmount,
      finalAmount: finalAmount.toFixed(2),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};




module.exports = {
  ApplyCouponOfferService,
  addNewCouponService,
  getCouponOfferService,
  getCouponOfferByIdService,
  getCouponOfferByUserIdService,
  updateCouponOfferService,
  deleteCouponOfferService,
};
