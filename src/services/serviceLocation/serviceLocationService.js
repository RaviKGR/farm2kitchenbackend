const { db } = require("../../confic/db");

const NewServieLocationService = async (input, output) => {
    const { city, postalCode, devileryDay } = input;
    const insertQuery = `INSERT INTO servicelocation (city, postal_code, devilery_day) VALUES (?, ?, ?)`
    db.query(insertQuery, [city, postalCode, devileryDay], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
          } else {
            output(null, { message: "location inserted successfully"});
          }
    })
}

module.exports = {NewServieLocationService}