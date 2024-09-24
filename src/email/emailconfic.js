const nodemailer = require("nodemailer");
const baseUrl = "https://localhost.com/verify"; // Use this base URL for the verification link

// Configure nodemailer transporter with environment variables
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

// Function to send OTP email
const sendOtpMail = async (to, data) => {
    const { token, user } = data; // Destructure token and user_id from data

    try {
        // Send the email
        const result = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: "Welcome to Farm2Kitchen",
            text: `Verify your Sign-Up by clicking this link: ${baseUrl}?token=${token}&user_id=${user}`,
            // You can add HTML version here if needed:
            // html: `<b>Verify your Sign-Up by clicking this link: <a href="${baseUrl}?token=${token}&user_id=${user}">Verify</a></b>`,
        });

        console.log("Mail sent successfully:", result);

        // Check if the email was sent successfully
        return !!result.messageId;

    } catch (error) {
        console.error("Error sending OTP email:", error);
        return { error: 'Error sending OTP email' };
    }
}

module.exports = sendOtpMail;
