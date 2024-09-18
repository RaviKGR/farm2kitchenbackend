const { SearchProduct, GetCategoryIdProdect } = require("../../services/CategoriesServices/productServices");

const GetSearchProducts = async (req, res) => {
    try {
        await SearchProduct(req, (err, data) => {
            if (err) {
                res.status(400).send(err.error);
            }
            else {
                res.status(200).send(data)
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Internal Server Error' })
    }
}


const GetCategoryIdProducts = async (req, res) => {
    try {
        await GetCategoryIdProdect(req, (err, data) => {
            if (err) {
                res.status(400).send(err.error)
            }
            else {
                res.status(200).send(data)
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' })
    }
}
module.exports = { GetSearchProducts, GetCategoryIdProducts };