const mercadopago = require("mercadopago");
const { PAYMENT_STATUS } = require("../lib/types/enums/paymentStatus");
const {
  createReserveByIdInMongoDB,
  getAllReserves,
  getReserve,
  updateReserveByIdInMongoDB,
  deleteReserveById,
  getReserveByQuery,
} = require("../models/reserves/reserves.model");

const {
  getEvent,
  updateEventByIdInMongoDB,
} = require("../models/events/events.model");

const {
  sendReserveConfirmationEmail,
} = require("../templates/reserve-confirmation");

const { sendStockAlertEmail } = require("../templates/stock-alert");
const {
  isExpiratedReserve,
  getExpirationDate,
  getFormatedDate,
} = require("../helpers/validateReserves");
const { adapterMPPaymentStatus } = require("../adapter/paymentStatus");
const {
  sendPaymentConfirmationEmail,
} = require("../templates/payment-confirmation");

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

async function httpAddNewReserve(req, res) {
  try {
    const reserve = req.body;

    // 1 se chequea que la reserva a agregar posea todos los campos requeridos.
    if (
      !reserve.firstName ||
      !reserve.lastName ||
      !reserve.dni ||
      !reserve.ticketQuantity ||
      !reserve.email ||
      !reserve.event
    ) {
      return res.status(400).json({
        success: false,
        message: "Falta cargar una de las propiedades del event.",
      });
    }
    // 2 se crea el link de pago
    const event = await getEvent(reserve.event);
    console.log(event);

    let preference = {
      items: [
        {
          title: `Reserva: ${event.title}`,
          unit_price: event.price,
          quantity: reserve.ticketQuantity,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
        failure: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
        pending: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
      },
      auto_return: "approved",
      expires: true,
      expiration_date_from: getFormatedDate(new Date()),
      expiration_date_to: getFormatedDate(getExpirationDate(new Date())),
    };

    const response = await mercadopago.preferences.create(preference);
    reserve.MPPreferenceId = response.body.id;
    reserve.paymentLink = response.body.init_point;
    reserve.paymentStatus = PAYMENT_STATUS.NOT_PAID;
    reserve.payments = [];
    console.log({ reserve });

    // 3 Se calcula el stock disponible
    const ticketsReserved = [...event.reserves, reserve].reduce(
      (reservesLength, reserve) => {
        const isValidatedReserve =
          !isExpiratedReserve(reserve.createdAt) ||
          [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS].includes(
            reserve.paymentStatus
          );
        const reservesLengthUpdated =
          reservesLength + (isValidatedReserve ? reserve.ticketQuantity : 0);
        return reservesLengthUpdated;
      },
      0
    );

    const ticketsAvailable = event.maxAttendance - ticketsReserved;

    console.log(
      `el cupo maximo del evento es: ${event.maxAttendance}, las entradas reservadas: ${ticketsReserved}, la disponibilidad luego de reservar: ${ticketsAvailable}.`
    );

    // Si no hay stock:

    if (ticketsAvailable < 0)
      return res.status(409).json({ message: "El cupo esta completo" });

    if (ticketsAvailable < 10)
      await sendStockAlertEmail(event, ticketsAvailable); // TO DO: Notificar a Gabriel cuando quedan menos de 10 entradas

    // 4 se crea la reserva
    const reserveCreated = await createReserveByIdInMongoDB(reserve);
    // 5 se agrega la reserva al evento
    await updateEventByIdInMongoDB(reserve.event, {
      $push: { reserves: reserveCreated._id.toString() },
    });

    await sendReserveConfirmationEmail(reserve, event);
    return res.status(201).json(reserveCreated);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetAllReserves(req, res) {
  try {
    const { search, page, items } = req.query;
    return res.status(200).json(await getAllReserves(+page, +items, search));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetReserve(req, res) {
  try {
    return res.status(200).json(await getReserve(req.params.id));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpUpdateReserve(req, res) {
  try {
    return res.status(201).json(reserveUpdated);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpDeleteReserve(req, res) {
  try {
    return res
      .status(200)
      .json({ success: true, message: "the reserve is deleted!" });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpPaymentReserveNotification(req, res) {
  try {
    console.log("body:", req.body);
    const payment = await mercadopago.payment.findById(req.body.data.id);
    res.status(200).send("OK");
    if (req.body.type == "test") {
      console.log("Notificación de pago de prueba recibida");
    } else if (req.body.data.id) {
      const merchantOrder = await mercadopago.merchant_orders.findById(
        payment.body.order.id
      );
      const MPPreferenceId = merchantOrder.body.preference_id;
      const status = payment.body.status;
      const reserve = await getReserveByQuery({ MPPreferenceId });
      console.log("reserve:", reserve);
      if (!reserve)
        throw new Error(
          "La reserva no ha sido encontrada por su campo MPPreferenceId"
        );
      console.log(
        `El estado del pago en mercadopago para la reserva del evento ${reserve.event.title} es ${status}`
      );
      const paymentStatusKey = adapterMPPaymentStatus(status);
      await updateReserveByIdInMongoDB(
        reserve._id,
        {
          $addToSet: { payments: { paymentId: req.body.data.id.toString() } },
          paymentStatus: PAYMENT_STATUS[paymentStatusKey],
        },
        { new: true }
      );
      if (PAYMENT_STATUS[paymentStatusKey] === PAYMENT_STATUS.SUCCESS) {
        await mercadopago.preferences.update({
          id: MPPreferenceId,
          expiration_date_to: getFormatedDate(new Date()),
        });
        await sendPaymentConfirmationEmail(reserve, reserve.event);
      }
    }
  } catch (err) {
    console.log(
      "Ha ocurrido un error en la validación de un pago con el webhook de mercadopago:",
      err
    );
  }
}

async function httpGetFeedbackReserve(req, res) {
  try {
    const payment = await mercadopago.payment.findById(req.query.payment_id);
    // const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
    // const preferenceId = merchantOrder.body.preference_id;
    const status = payment.body.status;
    const paymentStatusKey = adapterMPPaymentStatus(status);
    res.status(200).send({ status: PAYMENT_STATUS[paymentStatusKey] });
  } catch (err) {
    console.log("Ha ocurrido un error en la validación del pago - ", err);
  }
}

async function httpGetReservePayment(req, res) {
  try {
    const reserve = await getReserve(req.params.id);
    const payments = await Promise.all(
      reserve.payments.map(async (p) => {
        const payment = await mercadopago.payment.findById(p.paymentId);
        return {
          _id: p._id,
          status:
            PAYMENT_STATUS[adapterMPPaymentStatus(payment.response.status)],
          total_amount: payment.response.transaction_details.total_paid_amount,
          net_received_amount:
            payment.response.transaction_details.net_received_amount,
          client_email: payment.response.payer.email,
          client_phone: payment.response.payer.phone,
          currency_id: payment.response.currency_id,
          date_approved: payment.response.date_approved,
          date_created: payment.response.date_created,
          date_last_updated: payment.response.date_last_updated,
        };
      })
    );
    res.status(200).send(payments);
  } catch (err) {
    console.log("Ha ocurrido un error en la validación del pago - ", err);
  }
}

module.exports = {
  httpAddNewReserve,
  httpGetAllReserves,
  httpGetReserve,
  httpDeleteReserve,
  httpUpdateReserve,
  httpPaymentReserveNotification,
  httpGetFeedbackReserve,
  httpGetReservePayment,
};
