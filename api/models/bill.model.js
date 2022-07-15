const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const billSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    name: {
        type: String,
        require: true
    },
    total: {
        type: Number,
    },
    orderCode: {
        type: String,
        require: true
    },
    address: {
        to_ward_code: {
            type: String
        },
        to_district_id: {
            type: String
        },
        province: { type: String },
        district: { type: String },
        ward: { type: String },
        detail: { type: String },
    },
    phone: {
        type: String,
        required: true
    },
    billDetail: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
    }, ],

    paidAt: { type: Date },
    deliveryStatus: {
        type: String,
        default: 'Đang chờ xử lý'
    },
    deliveredAt: { type: Date },

    payment: {
        type: String,
        require: true,
        default: 'Thanh toán khi nhận hàng'
    },

    coupon: {
        require: false,
        code: {
            type: String
        },
        discount: {
            type: Number
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('bill', billSchema);