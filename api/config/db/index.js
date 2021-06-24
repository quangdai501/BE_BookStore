const mongoose = require('mongoose');
const config = require('../index');

async function connect() {
    try {
        await mongoose.connect(config.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('> Connect data successfully!');
    } catch (error) {
        console.log('> Connect data failure!');
    }
}

module.exports = { connect }