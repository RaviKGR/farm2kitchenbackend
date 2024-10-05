const { Parser } = require("json2csv");
const {
  addNewProductService,
  SearchProduct,
  GetCategoryIdProduct,
  getProductByProductIdService,
  getAllProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
  getProductBarCodeService,
  getBestSellerProductService,
  updateBestSellerProductService,
  getProductsToCSVService,
  getProductByCategoryIdService,
  updateProductImageService,
  getProductByProductNameService,
  updateProductAndCategoryMapService,
  getFilterProductService,
} = require("../../services/Product/productServices");

const addNewProductController = async (req, res) => {
  const {
    productId,
    productName,
    brandName,
    categoryId,
    imageTag,
    // isPrimary,
    description,
    size,
    type,
    purchasePrice,
    HST,
    barcode,
    purchaseDate,
    quantityInStock,
    price,
    reorderLevel,
    discountPercentage,
  } = req.body;
  const files = req.files;

  try {
    if (
      !productName ||
      !brandName ||
      // !categoryId ||
      // !isPrimary ||
      !imageTag ||
      !description ||
      !size ||
      !type ||
      !purchasePrice ||
      !HST ||
      !barcode ||
      !purchaseDate ||
      !quantityInStock ||
      !price ||
      !reorderLevel ||
      !discountPercentage
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);
      await addNewProductService(
        { ...req.body, images: imageUrls },
        (err, data) => {
          if (err) res.status(400).send(err.error);
          else res.status(201).send(data);
        }
      );
    }
  } catch (e) {
    throw e;
  }
};

const GetSearchProducts = async (req, res) => {
  try {
    const data = await SearchProduct(req); // Await the result from SearchProduct
    res.status(200).send(data); // Send the data if successful
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .send({ error: error.description || "Internal Server Error" });
  }
};

const GetCategoryIdProducts = async (req, res) => {
  try {
    await GetCategoryIdProduct(req, (err, data) => {
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

const getProductByCategoryIdController = async (req, res) => {
  const { categoryId } = req.query;
  try {
    await getProductByCategoryIdService(categoryId, (err, data) => {
      if (err) res.status(400).send(err.error);
      else res.status(200).send(data);
    });
  } catch (error) {
    throw error;
  }
};

const getProductByProductIdController = async (req, res) => {
  const { ProductId } = req.query;

  try {
    if (!ProductId) {
      res.status(400).send({ message: "Required All Fields" });
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
  const { categoryId, productName, limit, offset } = req.query;
  try {
    if (!categoryId) {
      if (!limit || !offset) {
        res.status(400).send({ message: "Required All Fields" });
      } else {
        await getAllProductService(req.query, (err, data) => {
          if (err) res.status(400).send(err.error);
          else res.send(data);
        });
      }
    } else if(productName || categoryId) {
      await getFilterProductService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
          else res.send(data);
      })
    }
  } catch (error) {
    throw error;
  }
};

const updateProductController = async (req, res) => {
  const {
    productId,
    productName,
    productBrand,
    categoryId,
    variantId,
    description,
    size,
    type,
    purchasePrice,
    HST,
    barcode,
    purchaseDate,
  } = req.body;

  console.log("Request Body: ", req.body); // Log the request body

  try {
    if (
      !productId ||
      !productName ||
      !productBrand ||
      !categoryId ||
      !variantId ||
      !description ||
      !size ||
      !type ||
      !purchasePrice ||
      !HST ||
      !barcode ||
      !purchaseDate
    ) {
      res.status(400).send({ message: "Required All Fields" });
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

const updateProductImageController = async (req, res) => {
  const id = req.body.id;
  const image = req.file ? req.file.filename : null;
  try {
    if (!id) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await updateProductImageService(id, image, (err, data) => {
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
      res.status(400).send({ message: "Required All Fields" });
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
      res.status(400).send({ message: "Required All Fields" });
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
      res.status(400).send({ message: "Required All Fields" });
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
  const { limit, offset } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await getBestSellerProductService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};
const updateBestSellerProductController = async (req, res) => {
  const { productId, bestSeller } = req.query;
  try {
    if (!productId || !bestSeller) {
      res.status(400).send({ message: "Required All Fields" });
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
          return res
            .status(404)
            .send({ message: "No products found for the given conditions." });
        }
        // Define the fields/columns for the CSV
        const fields = [
          { label: "Product ID", value: "product_id" },
          { label: "Name", value: "name" },
          { label: "Description", value: "description" },
          { label: "Price", value: "price" },
          { label: "Category ID", value: "category_id" },
          { label: "Barcode", value: "barcode" },
          { label: "Status", value: "status" },
          { label: "Best Seller", value: "best_Seller" },
          { label: "Product Deleted", value: "product_deleted" },
        ];

        // Convert JSON to CSV
        const json2csvParser = new Parser({ fields });
        const csvData = json2csvParser.parse(products);

        // Set headers for CSV download
        res.header("Content-Type", "text/csv");
        res.attachment("products.csv");
        return res.send(csvData);
      }
    });
  } catch (error) {
    console.error("Error generating CSV:", error);
    return res.status(500).send({ message: "Error generating CSV file." });
  }
};

const getProductByProductNameController = async (req, res) => {
  const { productName } = req.query;
  try {
    if (!productName) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await getProductByProductNameService(productName, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const updateProductAndCategoryMapController = async (req, res) => {
  const { categoryId, productId } = req.query;
  try {
    if (!categoryId || !productId) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await updateProductAndCategoryMapService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  GetSearchProducts,
  GetCategoryIdProducts,
  getProductByCategoryIdController,
  addNewProductController,
  getProductByProductIdController,
  getAllProductController,
  updateProductController,
  updateProductImageController,
  updateProductStatusController,
  deleteProductController,
  getProductBarCodeController,
  getBestSellerProductController,
  updateBestSellerProductController,
  exportProductsToCSVController,
  getProductByProductNameController,
  updateProductAndCategoryMapController,
};
