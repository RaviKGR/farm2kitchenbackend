const {
  addNewCouponService,
  getCouponOfferService,
  getCouponOfferByIdService,
  getCouponOfferByUserIdService,
  updateCouponOfferService,
  deleteCouponOfferService,
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
  const { limit, offset } = req.query;
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

module.exports = {
  addNewCouponConnteroller,
  getCouponOfferController,
  getCouponOfferByIdController,
  getCouponOfferByUserIdController,
  updateCouponOfferConteroller,
  deleteCouponOfferController,
};
