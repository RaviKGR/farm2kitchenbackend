const { db } = require("../../confic/db");

const AddNewCategoryService = async (input, output) => {
  const name = input.categoryName;
  const description = input.description;
  const parent_category_id = input.parentCategoryId;

  const insertCategory = `INSERT INTO category (name, description, parent_category_id) VALUES (?, ?, ?)`;

  db.query(
    insertCategory,
    [name, description, parent_category_id],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Category added successfully", result });
      }
    }
  );
};

const getCategoryService = async (input, output) => {
  const AllCategory = `SELECT * FROM category`;

  db.query(AllCategory, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getCategoryByIdService = async (input, output) => {
  const categoryId = input.CategoryId;

  const selectCategoryById = `SELECT category_id, name FROM category WHERE category_id = ?`;
  db.query(selectCategoryById, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getChildByCategoryIdService = async (input, output) => {
  const categoryId = input.CategoryId;

  const selectChildCategory = `SELECT category_id, name FROM category WHERE parent_category_id = ?`;

  db.query(selectChildCategory, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const updateCategoryService = async (input, output) => {
  const { CategoryId, name, description } = input;

  const updateCategory = `UPDATE category SET name = ?, description = ? WHERE category_id = ?`;

  db.query(updateCategory, [name, description, CategoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

module.exports = {
  AddNewCategoryService,
  getCategoryService,
  getCategoryByIdService,
  getChildByCategoryIdService,
  updateCategoryService,
};
