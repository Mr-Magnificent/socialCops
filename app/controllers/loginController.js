const fs = require('fs');
const bcrypt = require('bcrypt');
const debug = require('debug')('loginController:');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const sign = Promise.promisify(jwt.sign);
const verify = Promise.promisify(jwt.verify);

exports.login = async (req, res) => {
    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    if (req.body.email in file) {
        const storedPass = file[req.body.email];
        if (await bcrypt.compare(req.body.password, storedPass)) {
            // res.send({"message": "user matched"});
            const token = await sign(req.body.email, process.env.APP_KEY);
            res.cookie('jwt', token, {
                maxAge: 900000,
                httpOnly: true
            });
            res.sendStatus(200);
        } else {
            res.send({
                "message": "password does not match!"
            });
        }
    } else {
        res.send({
            "message": "Email not registered"
        });
    }
}

exports.create = async (req, res) => {
    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    if (req.body.email in file) {
        res.send({
            "message": "Email already exists!"
        });
        return;
    }
    const pass = await bcrypt.hash(req.body.password, parseInt(process.env.SALT));
    file[req.body.email] = pass;
    await fs.promises.writeFile(__dirname + '/../../loginDatabase.txt', JSON.stringify(file));
    res.sendStatus(200);
}

exports.logout = async (req, res) => {
    debug(__dirname + '/../../loginDatabase.txt');
    const email = await verify(req.cookies['jwt'], process.env.APP_KEY);
    res.clearCookie('jwt');
    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    delete file[email];
    await fs.promises.writeFile(__dirname + '/../../loginDatabase.txt', JSON.stringify(file));
    res.sendStatus(200);
}

const readFile = async (path) => {
    let file = await fs.promises.readFile(path);
    return JSON.parse(file);
}