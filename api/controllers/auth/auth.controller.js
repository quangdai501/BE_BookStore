
const User = require('../../models/user.model');
const sendMail = require('../../sendEmail');
const { getToken } = require('../../utils');

function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class LoginController {

  // [POST] api/auth/login
  async login(req, res, next) {

    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });

    if (user) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        token: getToken(user),
      });
      return;
    }
    else {
      res.status(401).send({ message: 'Email hoặc mật khẩu không chính xác!' });
    }
  }

  // [POST] - /api/auth/confirm-email
  async confirmEmail(req, res, next) {
    const { name, email, password } = req.body;
    const user = { name, email, password };

    try {
      const userExist = await User.findOne({ email });
      if (userExist) {
        res.status(401).send({ message: "Email đã tồn tại!" });
      } else {
        global.name = name;
        global.email = email;
        global.password = password;
        const code = getRandomNumberBetween(100000, 999999);
        global.code = code;
        const html = `<p>Mã xác thực của bạn là: <b>${code}</b></p>`;
        sendMail(email, 'NS3AE - Đăng ký tài khoản', html);
        res.send({ message: "Send email successfully!", data: user });
      }
    } catch (error) {
      res.send({ message: error.message });
    }
  }

  // [POST] - /api/fogot-password
  async fogotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        const subject = 'NS3AE - Đặt lại mật khẩu';
        const code = getRandomNumberBetween(100000, 999999);
        global.codeResetPass = code;
        global.email = email;
        const content = `
          <p>Xin chào ${user.name},</p>
          <p>NS3AE đã nhận được yêu cầu đổi mật khẩu của bạn. 
              Đây là mã kích hoạt để đổi mật khẩu: <b>${code}</b></p>
          <p>Nếu bạn không yêu cầu đổi mật khẩu thì hãy bỏ qua email này để tài khoản được bảo mật nhé!</p>
          <p>Trân trọng,</p>
          <p>NS3AE</p>`;
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
          res.send({ status: 'CODE_MATCHED' });
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
}

module.exports = new LoginController;
