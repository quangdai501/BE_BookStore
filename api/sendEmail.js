const nodemailer = require('nodemailer');

// const adminEmail = 'tranquangdai5012@gmail.com';
// const adminPassword = 'tranquangdai501';
const adminEmail = 'bookstore.ute.mail@gmail.com'
const adminPassword = "b5D{8HJuz=n7-'e>"

const sendMail = (toEmail, sub, htmlContent) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: adminEmail,
        to: toEmail,
        subject: sub,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error.message);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMail;