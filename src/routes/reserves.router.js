const express = require('express');
const { 
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpDeleteReserve,
    httpUpdateReserve
} = require('../controllers/reserves.controller')

const reservesRouter = express.Router()

reservesRouter.post('/', httpAddNewReserve);
reservesRouter.get('/', httpGetAllReserves);
reservesRouter.get('/', httpGetReserve);
reservesRouter.put('/:id', httpUpdateReserve);
reservesRouter.delete('/:id', httpDeleteReserve);

module.exports = reservesRouter;