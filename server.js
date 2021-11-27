const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const path = require('path');
const router = require('./api/route');
const db = require('./api/config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// connect to db
db.connect();

app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: "*",
}));
app.use(cookieParser());
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', router);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
