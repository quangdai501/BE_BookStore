const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ReviewSchema = new Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'product',
    },
}, {
    timestamps: true,
})
module.exports = mongoose.model('review', ReviewSchema);