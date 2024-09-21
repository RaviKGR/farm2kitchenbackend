const nodemailer = require("nodemailer");
const baseUrl = "https://localhost.com/verify";
const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // Use SSL
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendOtpMail = async (to, data) => {
    const token = data.token
    try {
        const result = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: "Welcome to Farm2kitchen",
            text: `Verify your Sing-Up  clicking this link:https://localhost:300.com/verify?token=${token}`,
            // html: "<b>Hello world?</b>", 
        })
        console.log(result);

        return !!result.messageId;

    } catch (error) {
        console.error(error);
        return { error: 'Error sending OTP email' };
    }
}

module.exports = sendOtpMail;