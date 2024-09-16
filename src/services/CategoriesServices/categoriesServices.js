const { db } = require("../../confic/db");

const AddNewCategoryService = async () => {

}
const getCategoryService = async () => {
    const AllCategory = `SELECT * FROM category`
}
db.query(AllCategory, (err, output) => {
    if (err) {
        output({ error: { description: err.message } }, null);  
    } else {
        // Prepend the base URL to each image path
        const categoriesWithImageUrls = result.map(category => {
          return {
            ...category,
            image: `${baseUrl}/${category.image}`
          };
        });
        output(null, categoriesWithImageUrls);
      }
})

module.exports = { AddNewCategoryService, getCategoryService };