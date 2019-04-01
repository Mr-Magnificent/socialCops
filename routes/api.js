const express = require('express');
require('dotenv').config();
const app = express.Router();

const authentication = require('../app/auth/authentication');
const loginController = require('../app/controllers/loginController');
const jsonPatch = require('../app/controllers/jsonPatch');

app.put('/create', loginController.create);
app.post('/login', loginController.login);

app.use(authentication(process.env.APP_KEY));

app.get('/logout', loginController.logout);
app.post('/patch', jsonPatch);
// app.post('/create', Authentication.create);

module.exports = app;