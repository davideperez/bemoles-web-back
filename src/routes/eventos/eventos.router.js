//////////////////////////////
// Imports
//////////////////////////////

const express = require('express');
const { httpGetAllEventos, httpAddNewEvento } = require('./eventos.controller')

//////////////////////////////
// varaibles & constants
//////////////////////////////

const eventosRouter = express.Router()

//////////////////////////////
// Behaviours
//////////////////////////////

eventosRouter.get('/', httpGetAllEventos); // read.

eventosRouter.post('/', httpAddNewEvento);

//////////////////////////////
// Exports
//////////////////////////////

module.exports = eventosRouter;