//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const { } = require('../models/reserves/reserves.model');
const reservesMongo = require('../models/reserves/reserves.mongo');

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

async function httpGetAllReserves(req, res) {
    return res.status(200).json(await getAllReserves()); //
};

async function httpAddNewReserve(req, res) {
   
};

async function httpDeleteReserve (req, res) {

}

async function httpUpdateReserve (req, res) {

}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    httpGetAllReserves,
    httpAddNewReserve,
    httpDeleteReserve,
    httpUpdateReserve
};