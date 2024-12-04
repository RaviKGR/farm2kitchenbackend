const { db } = require("../../confic/db");

const AddNewCategoryService = async (input, output) => {
  const name = input.categoryName;
  const description = input.description;
  const parent_category_id = Number(input.parentCategoryId) || null;
  const isPrimary = input.isPrimary;
  const imageTag = input.imageTag.toUpperCase();
  const image = `/uploads/${input.image}`;

  const verifiyCategory = `SELECT * FROM category WHERE name = ? AND deleted = "N"`;
  db.query(verifiyCategory, [name], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      if (result.length > 0) {
        output(null, { status: 400, message: "Category Already exists" });
      } else {
        const insertCategory = `
        INSERT INTO category (name, description, parent_category_id, deleted)
        VALUES (?, ?, ?, "N");
        SET @last_category_id = LAST_INSERT_ID();
        INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary)
        VALUES (@last_category_id, ?, ?, ?, ?);
        `;

        db.query(
          insertCategory,
          [
            name,
            description,
            parent_category_id,
            image,
            imageTag,
            name,
            isPrimary,
          ],
          (err, result) => {
            if (err) {
              output({ error: { description: err.message } }, null);
            } else {
              output(null, { message: "Category added successfully" });
            }
          }
        );
      }
    }
  });
};

const getCategoryService = async (input, output) => {
  const AllCategory = `SELECT c.category_id, c.name, c.description, c.parent_category_id, i.id, i.image_url, i.image_url
  FROM category c
  JOIN productimage i
  ON c.category_id = i.image_id AND (i.image_tag = "CATEGORY" OR i.image_tag = "category")
  WHERE c.deleted = "N"`;

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

const GetAllCategoryService = async (output) => {
  // const AllCategory = `SELECT category.category_id, name, description, parent_category_id, productimage.image_url FROM category
  // JOIN productimage
  // ON productimage.image_id = category.category_id
  // WHERE productimage.image_tag = "category" AND category.deleted = "N"`;

  const AllCategory = `SELECT * FROM category 
  JOIN productimage
  ON productimage.image_id = category.category_id
  WHERE productimage.image_tag = "category" AND category.deleted = "N"`;

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

  const selectCategoryById = `SELECT category.category_id, name, description, parent_category_id, productimage.image_url FROM category 
  JOIN productimage
  ON productimage.image_id = category.category_id
  WHERE category.category_id = ? AND category.deleted = "N"`;
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

  const selectChildCategory = `SELECT category_id, name FROM category WHERE parent_category_id = ? AND deleted = "N"`;

  db.query(selectChildCategory, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const GetParentCategoryService = async (output) => {
  const getQuery = `SELECT category_id, name FROM category WHERE parent_category_id is NULL AND deleted = "N"`;
  db.query(getQuery, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const updateCategoryService = async (input, output) => {
  const { categoryId, categoryName, description, image, id } = input;
  if (!categoryId) {
    return output({ error: { description: "Category ID is required" } }, null);
  }
  if (!categoryName) {
    return output(
      { error: { description: "Category name is required" } },
      null
    );
  }
  const checkCategoryExistsQuery = `
    SELECT category_id 
    FROM category 
    WHERE name = ? AND deleted = 'N' AND category_id != ?;
  `;

  db.query(
    checkCategoryExistsQuery,
    [categoryName, categoryId],
    (err, existingCategory) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else if (existingCategory.length > 0) {
        output(
          { error: { description: "Category name already exists" } },
          null
        );
      } else {
        const updateCategoryQuery = `
        UPDATE category 
        SET name = ?, description = ? 
        WHERE category_id = ?;
      `;

        db.query(
          updateCategoryQuery,
          [categoryName, description, categoryId],
          (err, result) => {
            if (err) {
              output({ error: { description: err.message } }, null);
            } else if (result.affectedRows === 0) {
              output(
                {
                  error: {
                    description: "No category found with the provided ID",
                  },
                },
                null
              );
            } else {
              const updateimage = `UPDATE productimage SET image_url = ? WHERE id = ?`;
              db.query(updateimage, [image, id], (err, result) => {
                if (err) {
                  output({ error: { description: err.message } }, null);
                } else {
                  output(null, { message: "Category updated successfully" });
                }
              });
              
            }
          }
        );
      }
    }
  );
};

//  Delete Category
const deleteCategoryService = async (CategoryId, output) => {
  const DeleteCategory = `UPDATE category SET deleted = "Y" WHERE category_id = ? OR parent_category_id = ?`;

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
  GetAllCategoryService,
  GetParentCategoryService,
};
