const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const DB = process.env.MONGODB_URL;
async function connect() {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('> Connect data successfully!');
    } catch (error) {
        console.log('> Connect data failure!');
    }
}

module.exports = { connect }