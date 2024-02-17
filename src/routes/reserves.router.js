const express = require('express');
const { verifyUser } = require('../authenticate');
const { 
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpGetReservePayment,
    httpGetFeedbackReserve,
    httpPaymentReserveNotification,
    httpCancelReserveOnMercadoPago,
    httpSetReserveToPaid,
    httpDeleteReserve,
} = require('../controllers/reserves.controller')

const reservesRouter = express.Router()

reservesRouter.post('/mpnotification', httpPaymentReserveNotification);
reservesRouter.post('/', httpAddNewReserve);
reservesRouter.get('/:id/payment/', httpGetReservePayment);
reservesRouter.get('/feedback', httpGetFeedbackReserve);
reservesRouter.get('/:id', httpGetReserve);
reservesRouter.get('/', httpGetAllReserves);
reservesRouter.put('/:id', verifyUser, httpCancelReserveOnMercadoPago);
reservesRouter.put('/:id', verifyUser, httpSetReserveToPaid);
reservesRouter.delete('/:id', verifyUser, httpDeleteReserve);

module.exports = reservesRouter;