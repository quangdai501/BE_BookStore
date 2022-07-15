const Coupon = require('../../models/coupon.model');
const User = require('../../models/user.model');

class CouponController {
    // [GET] - /api/coupons
    async getAllCoupon(req, res) {
        const isValid = req.query.isValid;
        try {
            let query = {};
            if (isValid) {
                const user = await User.findById(req.user._id);
                query = {
                    point_condition: {
                        $lte: user.point
                    }
                }
            }
            const coupons = await Coupon.find(query);
            if (coupons) {
                res.send(coupons);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [GET] - /api/coupons/is-valid?code
    async isValidCoupon(req, res) {
        const code = req.query.code;
        const userId = req.user._id;
        const total = req.query.total;
        try {
            const coupon = await Coupon.findOne({ code: code });
            if (!coupon) {
                res.status(400).send({ isValid: false, message: "Mã giảm giá không tồn tại" });
                return
            }


            if ((coupon.begin > Date.now() || Date.now() > coupon.end) || coupon.available <= 0 || !total) {
                res.status(400).send({ isValid: false, message: "Mã giảm giá không hợp lệ" });
                return
            }
            const user = await User.findById(userId);

            if (user.point < coupon.point_condition || total < coupon.min_order) {
                res.status(400).send({ isValid: false, message: "Đơn hàng không đủ điều kiện" });
                return
            }

            if (user.coupons && user.coupons.find(item => item.code === code)) {
                res.status(400).send({ isValid: false, message: "Mã giảm giá đã được sử dụng" });
            }

            res.send({ isValid: true, data: coupon });
        } catch (error) {
            res.status(400).send({ isValid: false, message: error.message });
        }
    }

    // [POST] - /api/coupons/
    async createCoupon(req, res) {

        try {
            const oldCoupon = await Coupon.findOne({ code: req.body.code });
            if (oldCoupon) {
                res.status(400).send({ message: "Mã giảm giá đã được tạo" });
                return
            }

            const coupon = new Coupon(req.body);
            const save = await coupon.save();
            if (save) {
                res.send({ message: "Add coupon successfully!", data: coupon });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // [PATCH] - /api/coupons/:id
    async updateCoupon(req, res) {

        const data = {...req.body };
        delete data.code;
        delete data._id;
        try {
            const updatedCoupon = await Coupon.updateOne({ _id: req.params.id }, {
                $set: req.body
            });
            if (updatedCoupon) {
                res.send({ message: 'Update coupon successfully!', data: updatedCoupon });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // [DELETE] - /api/coupons/:id
    async deleteCoupon(req, res) {
        try {
            const id = req.params.id;
            const delCoupon = await Coupon.deleteOne({ _id: id });
            res.send(delCoupon);

        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new CouponController;