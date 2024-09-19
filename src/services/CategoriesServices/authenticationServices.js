const { db } = require("../../confic/db");

const authentiCationService = async (input, output) => {
    const emailId = input.emailId;
    const password = input.hashedPassword;
    const otp = input.code;
    console.log(input)
    const authenticationQuery = `INSERT INTO users (email, password) VALUES (?, ?);
        SET @last_user_id = LAST_INSERT_ID();
        INSERT INTO otps (user_id,otp_code,expires_at) VALUES (@last_user_id, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));
       SELECT * FROM users WHERE user_id = @last_user_id;`
    db.query(authenticationQuery, [emailId, password, otp], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
            console.log(err);
            
        }
        else {
            const user = result[3][0].user_id;
            output(null, user)
            console.log(result);

        }
    })
}



module.exports = authentiCationService;