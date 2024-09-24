const {
  addNewProductService,
  SearchProduct,
  GetCategoryIdProdect,
  getProductByProductIdService,
  getAllProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
  getProductBarCodeService,
  getBestSellerProductService,
  updateBestSellerProductService,
  getProductsToCSVService,
} = require("../../services/Product/productServices");

const addNewProductController = async (req, res) => {
  const { productName, description, price, categoryId, barcode, isPrimary } =
    req.body;
  const files = req.files;

  try {
    if (
      !productName ||
      !description ||
      !price ||
      !categoryId ||
      !barcode ||
      !isPrimary ||
      !files ||
      files.length === 0
    ) {
      res.status(400).send({ message: "Check the data" });
    } else {
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);
      await addNewProductService(
        { ...req.body, images: imageUrls },
        (err, data) => {
          if (err) res.status(400).send(err.error);
          else res.send(data);
        }
      );
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
    barcode,
    isPrimary,
  } = req.body;
  const files = req.files;

  try {
    if (
      !productId ||
      !productName ||
      !description ||
      !price ||
      !categoryId ||
      !barcode ||
      !isPrimary ||
      !files ||
      files.length === 0
    ) {
      res.status(400).send({ message: "Check the data" });
    } else {
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);
      await updateProductService(
        { ...req.body, images: imageUrls },
        (err, data) => {
          if (err) res.status(400).send(err.error);
          else res.send(data);
        }
      );
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

const getProductBarCodeController = async (req, res) => {
  const { barCode } = req.query;
  try {
    if (!barCode) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await getProductBarCodeService(barCode, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};
const getBestSellerProductController = async (req, res) => {
  try {
    await getBestSellerProductService((err, data) => {
      if (err) res.status(400).send(err.error);
      else res.send(data);
    });
  } catch (error) {
    throw error;
  }
};
const updateBestSellerProductController = async (req, res) => {
  const { productId, bestSeller } = req.query;
  try {
    if (!productId || !bestSeller) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await updateBestSellerProductService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};
const exportProductsToCSVController = async (req, res) => {
  try {
    await getProductsToCSVService((err, products) => {
      if (err) {
        res.status(400).send(err.error);
      } else {
        if (!products.length) {
          return res.status(404).send({ message: 'No products found for the given conditions.' });
        }
        // Define the fields/columns for the CSV
        const fields = [
          { label: 'Product ID', value: 'product_id' },
          { label: 'Name', value: 'name' },
          { label: 'Description', value: 'description' },
          { label: 'Price', value: 'price' },
          { label: 'Category ID', value: 'category_id' },
          { label: 'Barcode', value: 'barcode' },
          { label: 'Status', value: 'status' },
          { label: 'Best Seller', value: 'best_Seller' },
          { label: 'Product Deleted', value: 'product_deleted' }
        ];

        // Convert JSON to CSV
        const json2csvParser = new Parser({ fields });
        const csvData = json2csvParser.parse(products);

        // Set headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment('products.csv');
        return res.send(csvData);
      }
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return res.status(500).send({ message: 'Error generating CSV file.' });
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
  getProductBarCodeController,
  getBestSellerProductController,
  updateBestSellerProductController,
  exportProductsToCSVController,
};
