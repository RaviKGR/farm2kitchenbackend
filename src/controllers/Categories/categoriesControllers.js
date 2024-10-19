const {
  AddNewCategoryService,
  getCategoryService,
  getCategoryByIdService,
  getChildByCategoryIdService,
  updateCategoryService,
  deleteCategoryService,
  GetAllCategoryService,
  GetParentCategoryService,
} = require("../../services/CategoriesServices/categoriesServices");

const AddNewCategoryController = async (req, res) => {
  const { categoryName, description, isPrimary, imageTag } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    if (!categoryName || !description || !image || !isPrimary || !imageTag) {
      return res.status(400).send({ message: "All fields are required" });
    } else {
      await AddNewCategoryService({ ...req.body, image }, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(data.status === 400 ? 400 : 201).send(data);
      });
    }
  } catch (e) {
    res.status(500).send({ error: { description: e.message } });
  }
};

const GetCategoryController = async (req, res) => {
  try {
    await getCategoryService(req, (err, data) => {
      if (err) res.status(400).send(err.error);
      else res.send(data);
    });
  } catch (error) {
    throw error;
  }
};
const GetAllCategoryController = async (req, res) => {
  try {
    await GetAllCategoryService((err, data) => {
      if (err) res.status(400).send(err.error);
      else res.send(data);
    });
  } catch (e) {
    throw e;
  }
};

const GetCategoryByIdConteroller = async (req, res) => {
  const CategoryId = req.query.CategoryId;

  try {
    if (!CategoryId) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await getCategoryByIdService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const GetChildByCategoryIdController = async (req, res) => {
  const CategoryId = req.query.CategoryId;

  try {
    if (!CategoryId) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await getChildByCategoryIdService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const GetParentCategoryController = async (req, res) => {
  try {
    await GetParentCategoryService((err, data) => {
      if (err) res.status(400).send(err.error);
      else res.send(data);
    });
  } catch (e) {
    throw e;
  }
};

const updateCategoryConteroller = async (req, res) => {
  console.log(req.body);
  
  const {
    categoryId,
    categoryName,
    description,
    parentCategoryId
  } = req.body;

  try {
    if (!categoryId || !categoryName || !description ) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await updateCategoryService({ ...req.body}, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const deleteCategoryController = async (req, res) => {
  const CategoryId = req.query.CategoryId;
  console.log("success");

  try {
    if (!CategoryId) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await deleteCategoryService(CategoryId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};
module.exports = {
  AddNewCategoryController,
  GetCategoryController,
  GetCategoryByIdConteroller,
  GetChildByCategoryIdController,
  updateCategoryConteroller,
  deleteCategoryController,
  GetAllCategoryController,
  GetParentCategoryController,
};
