const jwt = require('jsonwebtoken');
// const User = require('./models/user.model');
const getToken = (user) => {
    return jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET, {
            expiresIn: '24h',
        }
    );
};

const isAuth = (req, res, next) => {
    try {
        const authentizationHeaders = req.headers.authentization;
        const token = authentizationHeaders.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async(err, decode) => {
                if (err) {
                    return res.status(401).send({ message: 'Invalid Token' });
                }
                //This code will make our app slow down.
                // const currentUser = await User.findById(decode._id)
                // if (!currentUser || !currentUser.isActive) {
                //     return res.status(401).send({ message: 'User got banned from admin.' });
                // }
                req.user = decode;
                next();
                return;
            });
        } else {
            return res.status(401).send({ message: 'Token is not supplied.' });
        }
    } catch (error) {
        res.status(500).send(error.message);
        // console.log(req.headers);
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
}

const isShipper = (req, res, next) => {
    if (req.user && req.user.role === 'shipper') {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
}

module.exports = { getToken, isAuth, isAdmin, isShipper };