const express = require('express');
const { verifyUser } = require('../authenticate');
const { 
    httpAddNewReserve,
    httpPaymentReserveNotification,
    httpGetAllReserves,
    httpGetReserve,
    httpGetReservePayment,
    httpGetFeedbackReserve,
    httpCancelReserveOnMercadoPago,
    httpSetReserveToPaid,
    httpDeleteReserve,
} = require('../controllers/reserves.controller')

const reservesRouter = express.Router()

reservesRouter.post('/', httpAddNewReserve);
reservesRouter.post('/mpnotification', httpPaymentReserveNotification);

reservesRouter.get('/', httpGetAllReserves);
reservesRouter.get('/:id', httpGetReserve);
reservesRouter.get('/:id/payment/', httpGetReservePayment);
reservesRouter.get('/feedback', httpGetFeedbackReserve);

reservesRouter.put('/:id', verifyUser, httpCancelReserveOnMercadoPago);
reservesRouter.put('/:id', verifyUser, httpSetReserveToPaid);

reservesRouter.delete('/:id', verifyUser, httpDeleteReserve);

module.exports = reservesRouter;