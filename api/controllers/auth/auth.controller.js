const User = require('../../models/user.model');
const sendMail = require('../../sendEmail');
const { getToken } = require('../../utils');

// google auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const createUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        token: getToken(user),
    }
}
class LoginController {

    // [POST] api/auth/login
    async login(req, res) {

        const user = await User.findOne({
            email: req.body.email,
            password: req.body.password
        });
        if (user) {
            if (!user.isActive) {
                res.status(401).send({ message: 'Tài khoản của bạn đang bị cấm truy cập' });
                return
            }
            const userInfo = createUserResponse(user)
            res.send(userInfo);
            return;
        } else {
            res.status(401).send({ message: 'Email hoặc mật khẩu không chính xác!' });
        }
    }

    // [POST] api/auth/login-google
    async loginGoogle(req, res) {
        let token = req.body.token;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            });
            const payload = ticket.getPayload();
            const email = payload['email']
            const name = payload['family_name'] + ' ' + payload['given_name']

            const user = await User.findOne({
                email: email,
            });
            if (user) {
                const userInfo = createUserResponse(user)
                res.send(userInfo);
                return;
            } else {
                const randPassword = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
                const newUser = new User({
                    name: name,
                    email: email,
                    password: randPassword
                });
                const saveUser = await newUser.save();
                if (saveUser) {
                    const userInfo = createUserResponse(saveUser)
                    res.send(userInfo);
                } else {
                    res.send({ message: 'Input error!' });
                }
            }
        } catch (error) {
            res.send(error)
        }

    }

    // [POST] - /api/auth/confirm-email
    async confirmEmail(req, res) {
        const { name, email, password } = req.body;
        const user = { name, email, password };

        try {
            const userExist = await User.findOne({ email });
            if (userExist) {
                res.status(401).send({ message: "Email đã tồn tại!", success: false });
            } else {
                global.name = name;
                global.email = email;
                global.password = password;
                const code = getRandomNumberBetween(100000, 999999);
                global.code = code;
                const html = `<p>Mã xác thực của bạn là: <b>${code}</b></p>`;
                sendMail(email, 'BOOSTOREUTE - Đăng ký tài khoản', html);
                res.send({ message: "Send email successfully!", success: true, data: user });
            }
        } catch (error) {
            res.send({ message: error.message, success: false });
        }
    }

    // [POST] - /api/fogot-password
    async fogotPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (user) {
                const subject = 'BOOSTOREUTE - Đặt lại mật khẩu';
                const code = getRandomNumberBetween(100000, 999999);
                global.codeResetPass = code;
                global.email = email;
                const content = `
          <p>Xin chào ${user.name},</p>
          <p>BOOSTOREUTE đã nhận được yêu cầu đổi mật khẩu của bạn. 
              Đây là mã kích hoạt để đổi mật khẩu: <b>${code}</b></p>
          <p>Nếu bạn không yêu cầu đổi mật khẩu thì hãy bỏ qua email này để tài khoản được bảo mật nhé!</p>
          <p>Trân trọng,</p>
          <p>BOOSTOREUTE</p>`;
                sendMail(email, subject, content);
                res.send({ status: 'SENT_EMAIL', email, name: user.name });
            } else {
                res.status(401).send({ message: 'Email không tồn tại trong hệ thống!' });
            }
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    // [POST] - /api/auth/enter-code-reset-pass
    async enterCodeResetPass(req, res) {
            const { code } = req.body;
            try {
                const user = await User.findOne({ email: global.email });
                if (user) {
                    if (parseInt(code) === global.codeResetPass) {
                        res.status(200).send({ status: 'CODE_MATCHED' });
                    } else {
                        res.status(401).send({ message: 'Mã code không đúng!' });
                    }
                } else {
                    res.status(401).send({ message: 'Đã xảy ra lỗi!' });
                }
            } catch (error) {
                res.send({ message: error.message });
            }
        }
        // [POST] - /api/auth/reset-pass
    async resetPassword(req, res) {
        const { email, password } = req.body;
        try {
            const updateOne = await User.updateOne({ email }, { password });
            if (updateOne) {
                res.status(200).send({ message: "Cập nhật thành công" });
            }
        } catch (error) {
            res.status(501).send({ message: error.message });
        }
    }

}

module.exports = new LoginController;