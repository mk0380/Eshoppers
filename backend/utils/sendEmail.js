const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  let testAccount = await nodeMailer.createTestAccount();
  const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'karolann3@ethereal.email',
        pass: 'ySFMRYTJKNDAQbuW3c'
    }
});

  const mailOptions = {
    from: "karolann3@ethereal.email",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;