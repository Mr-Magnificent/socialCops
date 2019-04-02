const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const verify = Promise.promisify(jwt.verify);

module.exports = secret => async (req, res, next) => {
    let token = req.cookies['jwt'];
    let email;
    try {
        email = await jwt.verify(token, secret);
    } catch (err) {
        res.status(403).send("User not valid!");
        return;
    }
    if (!email) {
        res.status(500).send("Unexpected Error Occurred");
    }
    next();
}