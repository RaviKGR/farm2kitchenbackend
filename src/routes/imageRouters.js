const express = require("express");
const multer = require('multer');
const path = require('path');
const { addNewImageController, getImageController } = require("../controllers/imageController/imageController");

const imageRouters = express.Router();

const imageStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file,  cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
  });

   // Multer instances
   const uploadImage = multer({ storage: imageStorage });

   imageRouters.post('/addNewImage', uploadImage.single("image"), addNewImageController);
   imageRouters.get('/getImage', getImageController);

module.exports = imageRouters;