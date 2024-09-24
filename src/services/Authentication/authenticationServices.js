const { db } = require("../../confic/db");
const bcrypt = require('bcrypt');
const { GENERATE_TOKEN } = require("../../confic/JWT");

const authentiCationService = async (input, output) => {
    const { emailId, hashedPassword: password, mobilenumber, code: otp } = input;
    const authenticationQuery = `
        INSERT INTO users_credentials (email, password_hash, phone_number) VALUES (?, ?, ?);
        SET @last_user_id = LAST_INSERT_ID();
        INSERT INTO otps (user_id, otp_code, expires_at) 
        VALUES (@last_user_id, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));
        SELECT * FROM users_credentials WHERE user_id = @last_user_id;
    `;
    db.query(authenticationQuery, [emailId, password, mobilenumber, otp], async (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
            console.log(err);
        } else {

            const saltRounds = 10;
            const user = result[3][0].user_id;
            const verifycode = await bcrypt.hash(otp.toString(), saltRounds);
            const token = await GENERATE_TOKEN(otp, '1h');
            const data = { user, verifycode, token };
            const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`; db.query(insertToken, [user.user_id, token], (err, results) => {
                if (err) {
                    console.error("Database query error:", err);
                    return output({ error: { description: err.message } }, null);
                }
                next();
            })
            console.log(data);

            output(null, data);
        }
    });
};

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
        const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`; db.query(insertToken, [user.user_id, token], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return output({ error: { description: err.message } }, null);
            }
            next();
        })
        return output(null, { ...userWithoutPassword, token });
    });

}
const geustSignServices = (input, output) => {
    const { email, mobilenumber, code: otp } = input;
    const checkUserQuery = `SELECT * FROM users WHERE email = ? OR phone_number = ?`;
    db.query(checkUserQuery, [email, mobilenumber], async (err, result) => {
        if (err) {
            output({ error: { description: err.message } }, null);
            return;
        }
        if (result.length > 0) {
            console.log(result);

            const saltRounds = 10;
            const userId = result[0].user_id;
            const token = await bcrypt.hash(otp.toString(), saltRounds);
            const data = { success: true, userId, description: "User Already Exsist" };
            output(null, { ...data });
        }
        else {
            const geustSignQuery = `
                        INSERT INTO users (email, phone_number) VALUES (?, ?);
                        SET @last_user_id = LAST_INSERT_ID();
                        SELECT * FROM users WHERE user_id = @last_user_id;`;
            db.query(geustSignQuery, [email, mobilenumber], async (err, result) => {
                if (err) {
                    output({ error: { description: err.message } }, null);
                    console.log(err);
                } else {
                    const saltRounds = 10;
                    const userId = result[2][0].user_id;
                    const token = await bcrypt.hash(otp.toString(), saltRounds);
                    const data = { success: true, userId, description: "User created successfully" };
                    output(null, data);
                }
            });
        }

    });
}

const googleAuthentiCationServices = async (input, output) => {
    const { Email } = input;
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(checkUserQuery, [Email], async (err, result) => {

        if (err) {
            output({ error: { description: err.message } }, null);
        }
        if (result.length > 0) {
            console.log(result);
            // const saltRounds = 10;
            const userId = result[0].user_id;
            // const token = await bcrypt.hash(otp.toString(), saltRounds);
            const data = { success: true, userId, description: "User Already Exsist" };
            output(null, { ...data });
        }
        else {
            const geustSignQuery = `
                        INSERT INTO users (email) VALUES (?);
                        SET @last_user_id = LAST_INSERT_ID();
                        SELECT * FROM users WHERE user_id = @last_user_id;`;
            db.query(geustSignQuery, [Email], async (err, result) => {
                console.log(Email);

                if (err) {
                    output({ error: { description: err.message } }, null);
                    console.log(err);
                } else {
                    // const saltRounds = 10;
                    const userId = result[2][0].user_id;
                    console.log(result);
                    
                    // const token = await bcrypt.hash(otp.toString(), saltRounds);
                    const data = { success: true, userId, description: "User created successfully" };
                    output(null,data);
                }
            });
        }

    });
}
module.exports = { authentiCationService, otpVerificationServieces, googleAuthentiCationServices, geustSignServices, processLoginServieces };