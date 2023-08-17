const express = require('express');
const { verifyUser } = require('../authenticate');
const { 
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpDeleteReserve,
    httpUpdateReserve,
    httpPaymentReserveNotification,
    httpGetFeedbackReserve
} = require('../controllers/reserves.controller')

const reservesRouter = express.Router()

reservesRouter.post('/', httpAddNewReserve);
reservesRouter.get('/feedback', httpGetFeedbackReserve);
reservesRouter.get('/mpnotification', httpPaymentReserveNotification);
reservesRouter.get('/', httpGetAllReserves);
reservesRouter.get('/', httpGetReserve);
reservesRouter.put('/:id', verifyUser, httpUpdateReserve);
reservesRouter.delete('/:id', verifyUser, httpDeleteReserve);

module.exports = reservesRouter;