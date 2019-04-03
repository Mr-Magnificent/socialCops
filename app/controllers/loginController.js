const fs = require('fs');
const bcrypt = require('bcrypt');
const debug = require('debug')('loginController:');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const sign = Promise.promisify(jwt.sign);
const verify = Promise.promisify(jwt.verify);

exports.login = async (req, res) => {

    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    if (process.env.NODE_ENV === 'test')
        file = await readFile(__dirname + '/../../testDatabase.txt');

    if (req.body.email in file) {
        const storedPass = file[req.body.email];
        if (await bcrypt.compare(req.body.password, storedPass)) {
            const token = await sign(req.body.email, process.env.APP_KEY);

            res.cookie('jwt', token);
            res.sendStatus(200);
        } else {
            res.status(400).send({
                "message": "password does not match!"
            });
        }
    } else {
        res.status(400).send({
            "message": "Email not registered"
        });
    }
}

exports.create = async (req, res) => {
    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    if (process.env.NODE_ENV === 'test')
        file = await readFile(__dirname + '/../../testDatabase.txt');

    if (req.body.email in file) {
        res.status(403).send({
            "message": "Email already exists!"
        });
        return;
    }

    const pass = await bcrypt.hash(req.body.password, parseInt(process.env.SALT));
    file[req.body.email] = pass;

    if (process.env.NODE_ENV === 'test')
        await writeFile("test", file);
    else
        await writeFile("dev", file);

    res.status(200).send({
        "message": "user has been created!"
    });
}

exports.logout = async (req, res) => {
    const email = await verify(req.cookies['jwt'], process.env.APP_KEY);

    res.clearCookie('jwt');

    let file = await readFile(__dirname + '/../../loginDatabase.txt');
    if (process.env.NODE_ENV === 'test')
        file = await readFile(__dirname + '/../../testDatabase.txt');

    delete file[email];

    if (process.env.NODE_ENV === 'test')
        await writeFile("test", file);
    else
        await writeFile("dev", file);
        
    res.sendStatus(200);
}

const readFile = async (path) => {
    let file = await fs.promises.readFile(path);
    return JSON.parse(file);
}

const writeFile = async (path, data) => {
    if (path === 'test') 
        await fs.promises.writeFile(__dirname + '/../../testDatabase.txt', JSON.stringify(data));
    else
        await fs.promises.writeFile(__dirname + '/../../loginDatabase.txt', JSON.stringify(data));

}