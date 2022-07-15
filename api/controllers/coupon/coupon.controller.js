const Coupon = require('../../models/coupon.model');

class CouponController {
    // [GET] - /api/coupons
    async getAllCoupon(req, res) {
        try {
            const coupons = await Coupon.find();
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
        try {
            const coupon = await Coupon.findOne({ code: code });
            if (!coupon) {
                res.status(400).send({ isValid: false, message: "Mã giảm giá không tồn tại" });
                return
            }

            if ((coupon.begin <= Date.now() && Date.now() <= coupon.end) && coupon.available > 0) {
                res.send({ isValid: true, data: coupon });
                return
            }
            res.status(400).send({ isValid: false, message: "Mã giảm giá không hợp lệ" });
        } catch (error) {
            res.status(400).send({ isValid: false, error: error.message });
            // res.send({ msg: error.message });
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