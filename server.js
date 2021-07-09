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

var allowedOrigins = ['http://localhost:3000',
    'https://nongsan3ae.netlify.app'];
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
// app.use(cors({ credentials: true, origin: "https://nongsan3ae.netlify.app" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
