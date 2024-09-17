const { db } = require("../../confic/db");

const AddNewCategoryService = async (input, output) => {
  const name = input.categoryName;
  const description = input.description;
  const parent_category_id = input.parentCategoryId;

  const insertCategory = `INSERT INTO category (name, description, parent_category_id, category_deleted) VALUES (?, ?, ?, TRUE)`;

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
  const AllCategory = `SELECT category_id, name, description, parent_category_id FROM category WHERE category_deleted = TRUE`;

  db.query(AllCategory, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const categoryTree = (categories, parenId = null) => {
        return categories
          .filter((category) => category.parent_category_id === parenId)
          .map((category) => {
            const children = categoryTree(categories, category.category_id);
            return {
              ...category,
              child: children.length ? children : [],
            };
          });
      };
      const finalResult = categoryTree(result);

      output(null, finalResult);
    }
  });
};

const getCategoryByIdService = async (input, output) => {
  const categoryId = input.CategoryId;

  const selectCategoryById = `SELECT category_id, name FROM category WHERE category_id = ? AND category_deleted = TRUE`;
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

  const selectChildCategory = `SELECT category_id, name FROM category WHERE parent_category_id = ? AND category_deleted = TRUE`;

  db.query(selectChildCategory, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const updateCategoryService = async (input, output) => {
  const { CategoryId, categoryName, description } = input;

  const updateCategory = `UPDATE category SET name = ?, description = ? WHERE category_id = ?`;

  db.query(
    updateCategory,
    [categoryName, description, CategoryId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        const SelectData = `SELECT * FROM category WHERE category_id = ?`;
        db.query(SelectData, [CategoryId], (err, result) => {
          if (err) {
            output({ error: { description: err.message } }, null);
          } else {
            output(null, { message: "Updated Successfully", result });
          }
        });
      }
    }
  );
};

//  Delete Category
const deleteCategoryService = async (CategoryId, output) => {
  const DeleteCategory = `UPDATE category SET category_deleted = False WHERE category_id = ? OR parent_category_id = ?`;

  db.query(DeleteCategory, [CategoryId, CategoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const SelectData = `SELECT * FROM category WHERE category_id = ?`;
      db.query(SelectData, [CategoryId], (err, result) => {
        if (err) {
          output({ error: { description: err.message } }, null);
        } else {
          output(null, { message: "Categoryd deleted successfully", result });
        }
      });
    }
  });
};

module.exports = {
  AddNewCategoryService,
  getCategoryService,
  getCategoryByIdService,
  getChildByCategoryIdService,
  updateCategoryService,
  deleteCategoryService,
};
