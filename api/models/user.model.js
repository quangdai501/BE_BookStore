const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    }
})

module.exports = mongoose.model('user', UserSchema);
