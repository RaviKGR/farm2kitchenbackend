const { getCategoryService } = require("../../services/categoriesServices/categoriesServices");

const AddNewCategoryController = async (req, res) => {
    const { quantity, amount, bookingStatus } = req.body;

}

const GetCategoryController = async (req, res) => {
    const { quantity, amount, bookingStatus } = req.body;
try {
    const result =await getCategoryService()
} catch (error) {
    
}
}

module.exports = { AddNewCategoryController, GetCategoryController };