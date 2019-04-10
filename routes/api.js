const express = require('express');
require('dotenv').config();
const app = express.Router();

const authentication = require('../app/auth/authentication');
const loginController = require('../app/controllers/loginController');
const jsonPatchController = require('../app/controllers/jsonPatchController');
const imageController = require('../app/controllers/imageController');

app.put('/create', loginController.create);
app.post('/login', loginController.login);

app.use(authentication(process.env.APP_KEY));

app.get('/logout', loginController.logout);
app.get('/delete', loginController.delete);
app.post('/patch', jsonPatchController);
app.get('/image', imageController.resize);

module.exports = app;