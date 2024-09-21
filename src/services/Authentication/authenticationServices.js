const { db } = require("../../confic/db");
const bcrypt = require('bcrypt');
const { GENERATE_TOKEN } = require("../../confic/JWT");

const authentiCationService = async (input, output) => {
    const emailId = input.emailId;
    const password = input.hashedPassword;
    const otp = input.code;
    console.log(input)
    const authenticationQuery = `INSERT INTO users (email, password) VALUES (?, ?);
        SET @last_user_id = LAST_INSERT_ID();
        INSERT INTO otps (user_id,otp_code,expires_at) VALUES (@last_user_id, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));
       SELECT * FROM users WHERE user_id = @last_user_id;`
    db.query(authenticationQuery, [emailId, password, otp], async (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
            console.log(err);
        }
        else {
            const user = result[3][0].user_id;
            const token = await GENERATE_TOKEN(result[3][0].user_id, '10m');
            const data = { user, token }
            output(null, data)
            console.log(data);

        }
    })
}

const otpVerificationServieces = async (input, output) => {
    const verifiCationOtp = input.verificationotp;
    const userIdverificationotp = input.userIdverificationotp;
    const otpverificationquery = `SELECT * FROM otps WHERE user_id = ? AND otp_code = ?`;
    db.query(otpverificationquery, [userIdverificationotp, verifiCationOtp], (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
            console.log(err);
        }
        else {
            if (result.length > 0) {
                output(null, result)
            }
            else {
                output(null, { result: false })
                console.log(result);
            }

        }
    })
}

const processLoginServieces = async (input, output) => {
    const userEmail = input.UserMailId;
    const userPassword = input.UserPassword;
    const getLoginUserQuery = `SELECT * FROM users WHERE email = ? `

    db.query(getLoginUserQuery, [userEmail], async (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return output({ error: { description: err.message } }, null);
        }
        if (results.length === 0) {
            return output({ error: { message: 'Email not found password.' } }, null);
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(userPassword, user.password);
        if (!isPasswordValid) {
            return output({ error: { description: 'Incorrect password.' } }, null);
        }
        const { password, ...userWithoutPassword } = user;
        const token = await GENERATE_TOKEN(user.user_id, '1h');
        console.log(user.user_id, token);
        const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`;        db.query(insertToken, [user.user_id, token], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return output({ error: { description: err.message } }, null);
            }
            next();
        })
        return output(null, { ...userWithoutPassword, token });
    });

}

module.exports = { authentiCationService, otpVerificationServieces, processLoginServieces };