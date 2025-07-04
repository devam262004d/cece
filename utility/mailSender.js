const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodeMailer.createTransport({
      service: "gmail", // ✅ Simplified config
      auth: {
        user: process.env.EMAIL_USER|| "",
        pass: process.env.EMAIL_PASS|| "",
      },
    });

    let info = await transporter.sendMail({
      from: `"Interview App" <${process.env.EMAIL_USER||""}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

module.exports = mailSender;
