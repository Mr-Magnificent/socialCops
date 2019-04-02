const jimp = require('jimp');
const url = require('url');
const fs = require('fs');
const debug = require('debug')('ImageController');
const exec = require('child-process-promise').execFile;
const randomString = require('randomstring');

exports.resize = async (req, res) => {
    const imageUrl = url.parse(req.query.url).href;

    const isValidUrl = RegExp(/(https|http)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    const fileType = RegExp(/\.(jpg|png|jpeg|bmp|tiff)+$/);

    if (!isValidUrl.test(imageUrl)) {
        debug.extend('resize')(imageUrl + ' :Invalid url');
        return res.send({"message": "Invalid url"});
    }
    if (!fileType.test(imageUrl)) {
        debug.extend('resize')(imageUrl + ' :Invalid filetype');
        return res.send({"message": "Invalid mimetype"});
    }
    const type = fileType.exec(imageUrl)[0];

    const imageName = randomString.generate({length: 8, charset: 'alphabetic'}) + type;
    try {
        const result = await exec('curl', [imageUrl, '--output', imageName]);
        let stdout = result.stdout;
        debug.extend('curl stdout')(stdout);
        debug.extend('curl stderr')(result.stderr);
        let imageFile = await jimp.read(`./${imageName}`)
        await imageFile.resize(50, 50).writeAsync(`./${imageName}`);
        res.download(`./${imageName}`);
        setTimeout( async () => await fs.promises.unlink(__dirname + '/../../' + imageName), 0);
        debug.extend('filename')(__dirname + '/' + imageName);
    } catch (err) {
        debug.extend('curl error')(err.message);
    }

    // debug.extend('resize:')(imageUrl.href);
}