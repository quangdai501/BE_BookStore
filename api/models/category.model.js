const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    isDelete: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('category', CategorySchema);