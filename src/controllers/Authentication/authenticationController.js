const sendOtpMail = require("../../email/emailconfic");
const bcrypt = require('bcrypt')
const { authentiCationService, otpVerificationServieces } = require("../../services/Authentication/authenticationServices");

const addAuthenticationController = async (req, res) => {

    try {
        const { emailId, password } = req.body;
        const saltRounds = 10;
        console.log(emailId, password);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(hashedPassword);
        const code = Math.floor(1000 + Math.random() * 9000);
        const input = { emailId, hashedPassword, code };
        if (!emailId || !password) {
            return res.status(400).send("Invalid or missing email address");
        }
        const data = await new Promise((resolve, reject) => {
            authentiCationService(input, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        // Send OTP email
        const mailSuccess = await sendOtpMail(emailId, code);
        if (mailSuccess) {
            return res.status(200).json({ success: true, message: 'User Registered Successfully', userId: data });
        } else {
            return res.status(500).send({ error: 'Failed to send OTP email' });
        }

    } catch (error) {
        res.status(500).send({ error: "Internal server error" })
    }
}

const otpVerifiCationController = async (req, res) => {
    try {

        const { verificationotp } = req.body;
        const userIdverificationotp = req.query.userId;
        const input = { verificationotp, userIdverificationotp };
        if (!verificationotp || !userIdverificationotp) {
            return res.status(400).send("Check the otp");
        }
        else {
            await otpVerificationServieces(input, (err, data) => {
                if (err) res.status(400).send(err.error);
                else res.status(200).send(data);
                console.log(data);

            })
        }
    } catch (error) {
        res.status(500).send({ error: "Internal server error" })
    }
}

module.exports = { addAuthenticationController, otpVerifiCationController };