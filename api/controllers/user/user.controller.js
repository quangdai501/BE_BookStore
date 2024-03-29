const User = require('../../models/user.model');

class UserController {

    // [PATCH] - /api/users/update-info/:userID
    async updateUserInfo(req, res) {
            try {
                // const user = await User.updateOne({ _id: req.params.userID }, {
                //     $set: {
                //         name: req.body.name,
                //         // email: req.body.email,
                //         phone: req.body.phone,
                //         address: req.body.address,
                //     }
                // }, { new: true });
                // res.send(user);
                const name = req.body.name ? { name: req.body.name } : {}
                const phone = req.body.phone ? { phone: req.body.phone } : {}
                const address = req.body.address ? { address: req.body.address } : {}
                const id = req.params.userID ? req.params.userID : req.user._id
                const
                    update = {...name, ...phone, ...address },
                    options = { new: true, };
                // console.log(update)
                // Find the document
                const data = await User.findByIdAndUpdate(id, update, options);
                res.send(data)
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
        // [GET] - /api/users/getuser-info/
    async getUserInfoByID(req, res) {
            try {
                const user = await User.findById({ _id: req.user._id });
                res.send(user);
            } catch (error) {
                res.status(404).send({ message: error.message });
            }
        }
        // [GET] - /api/users
    async getAllUsers(req, res) {

        try {
            const users = await User.find({ role: 'user' });
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


        // try {
        //     const user = new User({
        //         name: "linh",
        //         email: "vanlinh",
        //         password: "1244"
        //     });
        //     const saveUser = await user.save();
        //     if (saveUser) {
        //         res.send({ message: "Add user successfully!", data: user });
        //     } else {
        //         res.send({ message: 'Input error!' });
        //     }
        // } catch (error) {
        //     res.send({ message: error.message });
        // }

    }

    // [PATCH] - /api/users/update-password
    async updatePassword(req, res) {
        const { email, oldPassword, newPassword } = req.body;
        try {
            const user = await User.findOne({ email: email })
            if (user.password !== oldPassword) {
                res.status(501).send({ message: "Mật khẩu cũ không đúng" })
            } else {
                const userUpdated = await User.updateOne({ email }, { password: newPassword });
                if (userUpdated) {
                    res.status(200).send({ message: "Update user successfully!", data: userUpdated });
                }
            }
        } catch (error) {
            res.status(501).send({ message: error.message });
        }
    }

    // [DELETE] - /api/users/:id
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            const activeUser = await User.findById(userId)

            if (!activeUser) {
                res.status(404).send({ msg: `User ${userId} not found` });
            }

            const isActive = activeUser.isActive;

            activeUser.isActive = !isActive

            await activeUser.save()

            res.send({ message: "Change active successfully" });
        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new UserController;