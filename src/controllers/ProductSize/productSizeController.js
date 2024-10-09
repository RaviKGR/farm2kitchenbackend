const { addNewProductSizeSerivce } = require("../../services/ProductSize/productSizeService");

const addNewProductSizeController = async (req, res) => {
    const {productSize} = req.body;
    try {
        if(!productSize) {
            res.status(400).send({message: "Require All Feilds"})
        } else {
            const result = await addNewProductSizeSerivce(productSize);
            console.log(result);
            return res.status(201).json(result);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

module.exports = {addNewProductSizeController}

  