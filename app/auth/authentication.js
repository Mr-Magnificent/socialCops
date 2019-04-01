const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const verify = Promise.promisify(jwt.verify);

module.exports = secret => async (req, res, next) => {
    let token = req.cookies['jwt'];
    let email;
    try {
        email = await jwt.verify(token, secret);
    } catch (err) {
        res.send("User not valid!");
    }
    if (!email) {
        res.send("Unexpected Error Occurred");
    }
    next();
}