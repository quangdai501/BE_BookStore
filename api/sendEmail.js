const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// const adminEmail = 'tranquangdai5012@gmail.com';
// const adminPassword = 'tranquangdai501';
const adminEmail = 'bookstore.ute.mail@gmail.com'
    // const adminPassword = "b5D{8HJuz=n7-'e>"

// https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1
// https://www.youtube.com/watch?v=ig8Y09N-pkI&ab_channel=RANGZONE
// https://developers.google.com/oauthplayground/

const refreshToken = '1//04bc_usKBVRwACgYIARAAGAQSNwF-L9Ir30w1Vh5SS5obD5a0lsOxeXfmcBYl7wsvFBqbrDAaq3u9iUfoKcrbg3Im5wVBWBhc8nM'
const clienSecret = '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'
const clientId = '193330644512-i09g5jkaudv300csnfsldvuoanr1fj6c.apps.googleusercontent.com'

const oauth2Client = new OAuth2(
    clientId, // ClientID
    clienSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: refreshToken
});
const accessToken = oauth2Client.getAccessToken()
const sendMail = async(toEmail, sub, htmlContent) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: adminEmail,
                clientId: clientId,
                clientSecret: clienSecret,
                refreshToken: refreshToken,
                accessToken: accessToken
            },
            tls: {
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
                console.log("error is " + error);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            } else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    })


}

module.exports = sendMail;