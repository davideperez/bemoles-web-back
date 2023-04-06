//////////////////////////////
// Imports
//////////////////////////////

const express = require('express');
const talleresRouter = require('./talleres/talleres.router')

//////////////////////////////
// Varaibles & Constants
//////////////////////////////

const api = express.Router();

//////////////////////////////
// Routes
//////////////////////////////

api.use('/talleres', talleresRouter);

//////////////////////////////
// Exports
//////////////////////////////

module.exports = api;