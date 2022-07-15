const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CouponSchema = new Schema({
    description: {
        type: String,
    },
    available: {
        type: Number,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    discount_type: {
        type: String,
        enum: ['NUMBER', 'PERCENT'],
        default: 'NUMBER',
    },
    discount: {
        type: Number,
        required: true,
    },
    min_order: {
        type: Number,
        default: 0
    },
    point_condition: {
        type: Number,
        default: 0
    },
    max_discount: {
        type: Number,
        required: true,
    },
    begin: {
        type: Number,
        required: true,
    },
    end: {
        type: Number,
        required: true,
    },

});
module.exports = mongoose.model('coupon', CouponSchema);