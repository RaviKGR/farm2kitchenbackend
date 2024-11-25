const { getCartService } = require("../../services/AddCartServices/AddCartServices");
const {
  addNewCouponService,
  getCouponOfferService,
  getCouponOfferByIdService,
  getCouponOfferByUserIdService,
  updateCouponOfferService,
  deleteCouponOfferService,
  ApplyCouponOfferService,
} = require("../../services/Offers/couponOfferService");

const addNewCouponConnteroller = async (req, res) => {
  const {
    userId,
    name,
    description,
    couponType,
    couponValue,
    maxDiscountAmt,
    minAmount,
    startDate,
    endDate,
  } = req.body;
  try {
    if (
      !userId ||
      !name ||
      !description ||
      !couponType ||
      !couponValue ||
      !maxDiscountAmt ||
      !minAmount ||
      !startDate ||
      !endDate
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      const Code = Math.floor(10000 + Math.random() * 90000);
      const Name = name
        .split(" ")
        .join("")
        .split("")
        .slice(0, 5)
        .join("")
        .toUpperCase();
      const couponCode = `${Name}_${Code}`;

      await addNewCouponService({ ...req.body, couponCode }, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const getCouponOfferController = async (req, res) => {
  const { limit, offset, CouponName, startDate, endDate } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send("Required All The Fields");
    } else {
      await getCouponOfferService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const getCouponOfferByIdController = async (req, res) => {
  const { couponId } = req.query;
  try {
    if (!couponId) {
      res.status(400).send("Required All The Fields");
    } else {
      await getCouponOfferByIdService(couponId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const getCouponOfferByUserIdController = async (req, res) => {
  const { userId, limit, offset } = req.query;
  try {
    if (!userId || !limit || !offset) {
      res.status(400).send("Required All The Fields");
    } else {
      await getCouponOfferByUserIdService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const updateCouponOfferConteroller = async (req, res) => {
  const { couponId, couponValue, startDate, endDate } = req.body;
  try {
    if (!couponId || !couponValue || !startDate || !endDate) {
      res.status(400).send("Required All The Fields");
    } else {
      await updateCouponOfferService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const deleteCouponOfferController = async (req, res) => {
  const { couponId } = req.query;
  try {
    if (!couponId) {
      res.status(400).send("Required All The Fields");
    } else {
      await deleteCouponOfferService(couponId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const ApplyCouponOfferController = async (req, res) => {
  const { couponCode, tepm_UserId } = req.body;

  if (!couponCode || !tepm_UserId) {
    return res.status(400).send("All fields are required");
  }

  try {
    const cartData = await getCartService(null, tepm_UserId);
    if (!cartData || cartData.items.length === 0) {
      return res.status(404).send("Cart is empty or not found");
    }
    if (cartData.total_Amount > 100) {
      const couponResponse = await ApplyCouponOfferService({ ...req.body, totalcouponAmount: cartData.total_Amount });
      return res.status(200).send(couponResponse);
    }
    return res.status(200).send("Coupon Not Available")
  } catch (error) {
    console.error("Error in ApplyCouponOfferController:", error);
    return res.status(500).send("Internal Server Error");
  }
};




module.exports = {
  ApplyCouponOfferController,
  addNewCouponConnteroller,
  getCouponOfferController,
  getCouponOfferByIdController,
  getCouponOfferByUserIdController,
  updateCouponOfferConteroller,
  deleteCouponOfferController,
};
