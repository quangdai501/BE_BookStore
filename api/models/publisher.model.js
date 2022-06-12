const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PublisherSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    isDelete: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('publisher', PublisherSchema);