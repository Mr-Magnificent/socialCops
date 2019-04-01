const jsonPatch = require('jsonpatch');
const debug = require('debug')('JSONPatch:')

module.exports = async (req, res) => {
    try {
        const updateJson = await jsonPatch.apply_patch(JSON.parse(req.body.json), JSON.parse(req.body.patch));
        res.send(updateJson);
    } catch (err) {
        debug(err);
        res.send("Patch was invalid!");
    }
}