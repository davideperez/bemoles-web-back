//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const express = require('express');
const eventosRouter = require('./eventos/eventos.router')

//-----------------------------------------------------------------------------------------------------//
// Varaibles & Constants
//-----------------------------------------------------------------------------------------------------//

const apiExpressRouter = express.Router();

//-----------------------------------------------------------------------------------------------------//
// Routes
//-----------------------------------------------------------------------------------------------------//

apiExpressRouter.use('/eventos', eventosRouter);

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = apiExpressRouter; 