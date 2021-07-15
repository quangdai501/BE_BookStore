const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const router = require('./api/route');
const db = require('./api/config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// connect to db
db.connect();

// bodyParser

const pulicPath = path.join(__dirname, '..', 'public');
router.use(express.static(pulicPath));
app.use(bodyParser.json());

app.use(cors({
    credentials: true,
    origin: '*'
}));
// app.use(cors({ credentials: true, origin: "https://nongsan3ae.netlify.app" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
