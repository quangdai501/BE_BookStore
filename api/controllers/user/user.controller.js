const User = require('../../models/user.model');

class UserController {

    //[PATCH] - /api/users/update-account/:userId
    async updateAccountByUserID(req, res) {
        try {
            const update = await User.updateOne(
                { _id: req.params.userID },
                {
                    $set: {
                        account: req.body.availableBalanceNew
                    }
                }
            );
            if (update) {
                const user = await User.findById({ _id: req.params.userID });
                res.send({ account: user.account });
            }
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
    //[GET] - /api/users/get-account/:userID 
    async getAccountByUserID(req, res) {
        try {
            const user = await User.findById({ _id: req.params.userID })
            res.send({ account: user.account });
        } catch (error) {
            res.status(404).send({ message: error.message });
        }
    }
    // [PATCH] - /api/users/update-info/:userID
    async updateUserInfo(req, res) {
        try {
            const user = await User.updateOne(
                { _id: req.params.userID },
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        address: req.body.address,
                    }
                }
            );
            res.send(user);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
    // [GET] - /api/users/getUser-info/:userID
    async getUserInfoByID(req, res) {
        try {
            const user = await User.findById({ _id: req.params.userID });
            res.send(user);
        } catch (error) {
            res.status(404).send({ message: error.message });
        }
    }
    // [GET] - /api/users
    async getAllUsers(req, res) {

        try {
            const users = await User.find();
            if (users) {
                res.send(users);
            } else {
                res.status(401).send({ error: 'Invalid user' });
            }
        } catch (error) {
            res.send({ msg: error.message });
        }
    }

    // [POST] - /api/users/add-user
    async addUser(req, res) {
        const { code } = req.body;
        if (parseInt(code) === global.code) {
            try {
                const user = new User({
                    name: global.name,
                    email: global.email,
                    password: global.password
                });
                const saveUser = await user.save();
                if (saveUser) {
                    res.send({ message: "Add user successfully!", data: user });
                } else {
                    res.send({ message: 'Input error!' });
                }
            } catch (error) {
                res.send({ message: error.message });
            }
        } else {
            res.status(401).send({ message: 'Bạn đã nhập sai mã!' })
        }
    }

    // [PATCH] - /api/users/update-password
    async updatePassword(req, res) {
        const { email, password } = req.body;
        try {
            const userUpdated = await User.updateOne({ email }, { password });
            if (userUpdated) {
                res.send({ message: "Update user successfully!", data: userUpdated });
            }
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    // [DELETE] - /api/users/:id
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deletedUser = await User.deleteOne({ _id: userId });
            res.send(deletedUser);
        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new UserController;
