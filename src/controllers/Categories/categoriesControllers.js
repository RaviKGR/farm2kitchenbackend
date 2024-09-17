const { AddNewCategoryService, getCategoryService, getCategoryByIdService, getChildByCategoryIdService, updateCategoryService } = require("../../services/categoriesServices/categoriesServices");


const AddNewCategoryController = async (req, res) => {
  const { categoryName, description, parentCategoryId } = req.body;

  try {
    if (!categoryName || !description) {
      return res.status(400).send({ message: "Check the data" });
    } else {
      await AddNewCategoryService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(200).send(data);
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

const GetCategoryByIdConteroller = async (req, res) => {
  const CategoryId = req.query.CategoryId;

  try {
    if (!CategoryId) {
      res.status(400).send({ message: "Check the data" });
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
      res.status(400).send({ message: "Check the data" });
    } else {
      await getChildByCategoryIdService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
}

const updateCategoryConteroller = async (req, res) => {
  const { CategoryId, name, description } = req.body;

  try {
    if (!CategoryId, !name, !description) {
      res.status(400).send({ message: "Check the data" });
    } else {
      await updateCategoryService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }

  } catch (e) {
    throw e;
  }
}

module.exports = {
  AddNewCategoryController,
  GetCategoryController,
  GetCategoryByIdConteroller,
  GetChildByCategoryIdController,
  updateCategoryConteroller
};
