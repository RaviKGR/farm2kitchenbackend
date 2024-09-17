const { db } = require("../../confic/db");

const SearchProduct = async (input, output) => {
    const SearchName = input.query.SearchName
    const Searchproduct = `SELECT * FROM product WHERE name LIKE ?`

    db.query(Searchproduct, [`%${SearchName}%`], (err, result) => {
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
    const categoryProdect = `SELECT * FROM product WHERE category_id LIKE ?`;

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