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
    pass: process.env.MAIL_PASS,
  },
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
    return { error: "Error sending OTP email" };
  }
};
const GREETINGS_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Farm2Kitchen - Account Credentials</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
            border-radius: 8px;
        }
        .header {
            background-color: #28a745;
            padding: 10px;
            color: white;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: white;
            border-radius: 0 0 8px 8px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        a {
            color: #28a745;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Farm2Kitchen - Account Credentials</h2>
        </div>
        <div class="content">
            <p>Dear [name],</p>
            <p>Welcome to Farm2Kitchen! We are excited to have you as part of our community where fresh, organic farm products meet your kitchen.</p>
            <p>Below are your account credentials:</p>
            <ul>
                <li><strong>Name</strong>: [name]</li>
                <li><strong>Email</strong>: [email]</li>
                <li><strong>Password</strong>: [password]</li>
            </ul>
            <p>You can log in to your account by visiting the following link:</p>
            <p><a href="[login_url]" target="_blank">Farm2Kitchen Login</a></p>
            <p>Once logged in, we highly recommend updating your password to something more secure. You can do this by navigating to the "Account Settings" section.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@farm2kitchen.com">support@farm2kitchen.com</a>.</p>
            <p>Thank you for choosing Farm2Kitchen, and we look forward to providing you with the best farm-to-table experience!</p>
            <p>Best regards,</p>
            <p><strong>The Farm2Kitchen Team</strong></p>
        </div>
        <div class="footer">
            <p>Farm2Kitchen | <a href="[company_website]" target="_blank">farm2kitchen.com</a> | <a href="mailto:support@farm2kitchen.com">support@farm2kitchen.com</a></p>
        </div>
    </div>
</body>
</html>
`;
const FORGOT_PASSWORD_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Farm2Kitchen - Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
            border-radius: 8px;
        }
        .header {
            background-color: #dc3545;
            padding: 10px;
            color: white;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: white;
            border-radius: 0 0 8px 8px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        a {
            color: #28a745;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Farm2Kitchen - Password Reset</h2>
        </div>
        <div class="content">
            <p>Dear [name],</p>
            <p>We have received a request to reset your password. Please find your new temporary password below:</p>
            <ul>
                <li><strong>New Password</strong>: [password]</li>
            </ul>
            <p>You can log in to your account using this new password by visiting the following link:</p>
            <p><a href="[login_url]" target="_blank">Farm2Kitchen Login</a></p>
            <p>For your security, we highly recommend that you update your password immediately after logging in. You can do this by navigating to the "Account Settings" section and choosing a new, more secure password.</p>
            <p>If you did not request this password reset, please contact our support team right away at <a href="mailto:support@farm2kitchen.com">support@farm2kitchen.com</a>.</p>
            <p>Thank you for being a valued member of Farm2Kitchen.</p>
            <p>Best regards,</p>
            <p><strong>The Farm2Kitchen Team</strong></p>
        </div>
        <div class="footer">
            <p>Farm2Kitchen | <a href="[company_website]" target="_blank">farm2kitchen.com</a> | <a href="mailto:support@farm2kitchen.com">support@farm2kitchen.com</a></p>
        </div>
    </div>
</body>
</html>
`;

const loadTemplate = (data, template) => {
  let newTemplate = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\[\\s*${key}\\s*\\]`, "g");
    newTemplate = newTemplate.replace(regex, value);
  });

  return newTemplate;
};
const SENDEMAIL = async (to, template) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: to,
      subject: "Welcome to Farm2Kitchen",
      html: template,
    });

    console.log("Mail sent successfully:", result);

    // Check if the email was sent successfully
    return !!result.messageId;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { error: "Error sending OTP email" };
  }
};

module.exports = {
  sendOtpMail,
  loadTemplate,
  SENDEMAIL,
  GREETINGS_TEMPLATE,
  FORGOT_PASSWORD_TEMPLATE,
};
