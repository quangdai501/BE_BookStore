const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "author",
        required: true
    },
    publisherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "publisher",
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    isDelete: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sold: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true
});
ProductSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('product', ProductSchema);