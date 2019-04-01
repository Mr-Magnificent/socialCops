const express = require("express");
const app = express();
require('dotenv').config();
const debug = require('debug')('index:');
const router = require('./routes/api');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());

debug('hello');

app.use('/api', router);

app.listen(PORT, () => {
    debug('Server listening on port ' + PORT);
    console.log("server on");
})
