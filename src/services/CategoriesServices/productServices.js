const { db } = require("../../confic/db");

const SearchProduct = async (input, output) => {
    const SearchName = input.query.SearchName
    const SearchProductWithCategory = `
    SELECT 
        p.product_id, p.name AS product_name, p.description, p.price, p.barcode,
        c.category_id, c.name AS category_name, c.description AS category_description
      FROM 
        Product p
      JOIN 
        Category c ON p.category_id = c.category_id
      WHERE 
        p.name LIKE ? OR c.name LIKE ?
  `;
    db.query(SearchProductWithCategory,[`%${SearchName}%`, `%${SearchName}%`], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null)
        }
        else {
            output(null, result)
        }
    })
}

const GetCategoryIdProdect = async (input, output) => {
    const category_id = input.query.categoryId;
    const categoryProdect = `SELECT * FROM product WHERE category_id = ?`;

    db.query(categoryProdect, [category_id], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null)
        }
        else {
            output(null, result)
        }
    })

}


module.exports = { SearchProduct, GetCategoryIdProdect };