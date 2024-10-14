const { addNewProductSizeSerivce, getAllProuctSizeService } = require("../../services/ProductSize/productSizeService");

const addNewProductSizeController = async (req, res) => {
    const {productSize} = req.body;
    try {
        if(!productSize) {
            res.status(400).send({message: "All fields are required"})
        } else {
            const result = await addNewProductSizeSerivce(productSize);
            return res.status(result.success ? 201 : 400).json(result);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const getAllProuctSizeConttroler = async (req, res) => {
    try {
        const result = await getAllProuctSizeService();
            return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {addNewProductSizeController, getAllProuctSizeConttroler}

