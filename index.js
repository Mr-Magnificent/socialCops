const express = require("express");
const app = express();
require('dotenv').config();
const debug = require('debug')('index:');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');

const router = require('./routes/api');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));

if(process.env.NODE_ENV !== 'test') {
    app.use(morgan("combined"));
}

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', router);

app.listen(PORT, () => {
    debug('Server listening on port ' + PORT);
})

module.exports = app