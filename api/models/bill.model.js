const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const billSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    total: {
        type: Number,
    },
    address: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        required: true
    },
    billDetail: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            name: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
        },
    ],
    isPaid: {
        type: Boolean,
        require: true,
        default: false
    },
    paidAt: { type: Date },
    deliveryStatus: {
        type: String,
        default: 'Đang chờ xử lý'
    },
    deliveredAt: { type: Date },
    shipper: { type: mongoose.Schema.Types.ObjectID, ref: 'user' },
    payment: {
        type: String,
        require: true,
        default: 'Thanh toán khi nhận hàng'
    },
    shipPrice: {
        type: Number,
        default: 15000
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('bill', billSchema);