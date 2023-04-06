//////////////////////////////
// Imports
//////////////////////////////

const { getAllTalleres } = require('../../models/talleres.model');

//////////////////////////////
// varaibles & constants
//////////////////////////////



//////////////////////////////
// Behaviours
//////////////////////////////

async function httpGetAllTalleres(req, res) {
    return res.status(200).json(await getAllTalleres);
};

//////////////////////////////
// Exports
//////////////////////////////

module.exports = {
    httpGetAllTalleres,
};