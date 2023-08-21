const express = require('express');
const { verifyUser } = require('../authenticate');
const { 
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpDeleteReserve,
    httpUpdateReserve,
    httpPaymentReserveNotification,
    httpGetFeedbackReserve,
    httpGetReservePayment,
} = require('../controllers/reserves.controller')

const reservesRouter = express.Router()

reservesRouter.post('/mpnotification', httpPaymentReserveNotification);
reservesRouter.post('/', httpAddNewReserve);
reservesRouter.get('/:id/payment/', httpGetReservePayment);
reservesRouter.get('/feedback', httpGetFeedbackReserve);
reservesRouter.get('/:id', httpGetReserve);
reservesRouter.get('/', httpGetAllReserves);
reservesRouter.put('/:id', verifyUser, httpUpdateReserve);
reservesRouter.delete('/:id', verifyUser, httpDeleteReserve);

module.exports = reservesRouter;