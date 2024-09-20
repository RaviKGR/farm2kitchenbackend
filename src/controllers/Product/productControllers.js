const { addNewProductService, SearchProduct, GetCategoryIdProdect, getProductByProductIdService, getAllProductService, updateProductService, updateProductStatusService, deleteProductService } = require("../../services/Product/productServices");


const addNewProductController = async (req, res) => {
  const { productName, description, price, categoryId, packagingId, barcode } =
    req.body;
  try {
    if (
      !productName ||
      !description ||
      !price ||
      !categoryId ||
      !packagingId ||
      !barcode
    ) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await addNewProductService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};
const GetSearchProducts = async (req, res) => {
  try {
    await SearchProduct(req, (err, data) => {
      if (err) {
        res.status(400).send(err.error);
      } else {
        res.status(200).send(data);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const GetCategoryIdProducts = async (req, res) => {
  try {
    await GetCategoryIdProdect(req, (err, data) => {
      if (err) {
        res.status(400).send(err.error);
      } else {
        res.status(200).send(data);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const getProductByProductIdController = async (req, res) => {
  const { ProductId } = req.query;

  try {
    if (!ProductId) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await getProductByProductIdService(ProductId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const getAllProductController = async (req, res) => {
  try {
    await getAllProductService(req, (err, data) => {
      if (err) res.status(400).send(err.error);
      else res.send(data);
    });
  } catch (error) {
    throw error;
  }
};

const updateProductController = async (req, res) => {
  const {
    productId,
    productName,
    description,
    price,
    categoryId,
    packagingId,
    barcode,
  } = req.body;
  try {
    if (
      !productId ||
      !productName ||
      !description ||
      !price ||
      !categoryId ||
      !packagingId ||
      !barcode
    ) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await updateProductService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const updateProductStatusController = async (req, res) => {
  const { productId, productStatus } = req.query;
  try {
    if (!productId || !productStatus) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await updateProductStatusService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const deleteProductController = async (req, res) => {
  const { productId } = req.query;
  try {
    if (!productId) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await deleteProductService(productId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

module.exports = {
  GetSearchProducts,
  GetCategoryIdProducts,
  addNewProductController,
  getProductByProductIdController,
  getAllProductController,
  updateProductController,
  updateProductStatusController,
  deleteProductController,
};
