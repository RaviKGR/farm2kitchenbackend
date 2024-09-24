const sendOtpMail = require("../../email/emailconfic");
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const { authentiCationService, otpVerificationServieces, processLoginServieces, geustSignServices, googleAuthentiCationServices } = require("../../services/Authentication/authenticationServices");

const addAuthenticationController = async (req, res) => {
    try {
        const { emailId, password, mobilenumber } = req.body;
        if (!emailId && !mobilenumber) {
            return res.status(400).json({ error: "Email address or mobile number is required" });
        }
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const code = Math.floor(1000 + Math.random() * 9000);
        const input = { emailId, hashedPassword, code, mobilenumber };
        const data = await new Promise((resolve, reject) => {
            authentiCationService(input, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        // Send the OTP email
        const mailSuccess = await sendOtpMail(emailId, data);
        if (mailSuccess) {
            return res.status(200).json({ success: true, message: 'User registered successfully. OTP sent to email.' });
        }
        else {
            return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
        }
    } catch (error) {
        console.error("Error in addAuthenticationController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


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

const userLoginController = async (req, res) => {
    try {
        const UserMailId = req.body.email;
        const UserPassword = req.body.password;
        const input = { UserMailId, UserPassword }
        if (!UserMailId || !UserPassword) {
            res.status(400).send("Check the data")
        }
        else {
            await processLoginServieces(input, (err, data) => {
                if (err) res.status(400).send(err.error);
                else res.status(200).send(data);
            })
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }
}
const geustSignController = async (req, res) => {
    const { email, mobilenumber } = req.body;
    const code = Math.floor(1000 + Math.random() * 9000);
    const input = { email, code, mobilenumber };
    try {
        if (!email && !mobilenumber) {
            res.status(400).send("Check the data");
        }
        const guestSignServiceAsync = promisify(geustSignServices);
        const data = await guestSignServiceAsync(input);
        if (!data.success) {
            return res.status(200).json({ ...data });
        }
        return res.status(200).json({ ...data });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

const googleAuthenticationController = async (req, res) => {
    const Email = req.body;
    try {
        if (!Email) {
            return res.status(400).json({
                success: false,
                message: 'check The Field'
            })
        }
        else {
            await googleAuthentiCationServices(req.body, (err, data) => {
                if (err) {
                    return res.status(400).send(err.error)
                }
                else {
                    return res.status(200).json({
                        success: true,
                        ...data,
                    })
                }
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        })
    }
}

const signOutController = async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Failed to sign out" });
        res.status(200).json({ message: "SignOut successful" });
    });
};

module.exports = { addAuthenticationController, googleAuthenticationController, otpVerifiCationController, userLoginController, geustSignController, signOutController };