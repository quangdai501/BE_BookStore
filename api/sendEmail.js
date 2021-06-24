const nodemailer = require('nodemailer');

const adminEmail = 'tranquangdai5012@gmail.com';
const adminPassword = 'tranquangdai501';

const sendMail = (toEmail, sub, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: adminEmail,
            pass: adminPassword
        }
    });

    const mailOptions = {
        from: adminEmail,
        to: toEmail,
        subject: sub,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error.message);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMail;


