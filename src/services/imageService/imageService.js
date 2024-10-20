const { query } = require("express");
const { db } = require("../../confic/db");

// const addNewImageservice = async (input) => {
//   const { imageId, altText, isPrimary, images } = input;
//   const imageTag = input.imageTag.toUpperCase();
//   console.log(input);

//   try {
//     const results = await Promise.all(
//       images.map((image) => {
//         return query(
//           `
//           INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary)
//                 VALUES (?, ?, ?, ?, ?);
//               `,
//           [imageId, image, imageTag, altText, isPrimary]
//         );
//       })
//     );
//     const allInsertsSuccessful = results.every(
//       (result) => result.affectedRows > 0
//     );

//     if (allInsertsSuccessful) {
//       return {
//         success: true,
//         status: 200,
//         message: "All images added successfully",
//       };
//     } else {
//       return {
//         success: false,
//         status: 400,
//         message: "Some images failed to insert",
//       };
//     }
//   } catch (e) {
//     console.error(e);
//     return { success: false, status: 500, message: "Database error" };
//   }
// };

const addNewImageservice = async (input) => {
  const { imageId, altText, isPrimary} = input;
  const imageTag = input.imageTag.toUpperCase();
  const image = `/uploads/${input.image}`;

  try {
    const insertQuery = `INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary)
                VALUES (?, ?, ?, ?, "N");`;
    const [insert] = await db.promise().query(insertQuery, [imageId, image, imageTag, altText]);
    if(insert.affectedRows > 0) {
      return {success: true, status: 201, message: "Image Added successfully"}
    } else {
      return {success: false, status: 500, message: "Unable to upload"}
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

const getImageService = async () => {
  try {
    const selectQuery = `SELECT * FROM productimage`;
    const [result] = await db.promise().query(selectQuery);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

module.exports = { addNewImageservice, getImageService };
