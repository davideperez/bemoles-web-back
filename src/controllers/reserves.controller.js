const mercadopago = require("mercadopago");
const { PAYMENT_STATUS, MP_PAYMENT_STATUS } = require("../lib/types/enums/paymentStatus")
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
const { validateReserveExpiration, getExpirationDate } = require("../helpers/validateReserves");

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
        },
      ],
      back_urls: {
        success: `${process.env.URL_FRONTEND}/feedback/${event._id}/success`,
        failure: `${process.env.URL_FRONTEND}/feedback/${event._id}/failure`,
        pending: `${process.env.URL_FRONTEND}/feedback/${event._id}/pending`,
      },
      auto_return: "approved",
      // expires: true,
      // expiration_date_from: new Date().toISOString(),
      // expiration_date_to: getExpirationDate(new Date(), 48).toISOString(),
    };

    const response = await mercadopago.preferences.create(preference);
    reserve.MPPreferenceId = response.body.id;
    reserve.paymentLink = response.body.sandbox_init_point;
    reserve.paymentStatus = PAYMENT_STATUS.NOT_PAID;
    console.log({reserve})
    
    // 3 Se calcula el stock disponible
    const ticketsReserved = [...event.reserves, reserve].reduce(
      (reservesLength, reserve) => {
        const isValidatedReserve = validateReserveExpiration(reserve.createdAt) || [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS].includes(reserve.paymentStatus)
        const reservesLengthUpdated = reservesLength + (isValidatedReserve ? reserve.ticketQuantity : 0);
        return reservesLengthUpdated;
      },
      0
    );

    const ticketsAvailable = event.maxAttendance - ticketsReserved;

    console.log(
      `el cupo maximo del evento es: ${event.maxAttendance}, las entradas reservadas: ${ticketsReserved}, la disponibilidad antes de reservar: ${ticketsAvailable}.`
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
  res.status(200).send('OK');
  if (req.body.type == "test"){
      console.log('Notificación de pago de prueba recibida')
  }
  else if (req.body.data.id) {
  const payment = await mercadopago.payment.findById(req.body.data.id);
  const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
  const MPPreferenceId = merchantOrder.body.preference_id;
  const status = payment.body.status;
  const reserve = await getReserveByQuery({ MPPreferenceId });
  if (!reserve) throw new Error('La reserva no ha sido encontrada por su campo MPPreferenceId')
  console.log(`El estado del pago en mercadopago para la reserva del evento ${reserve.event.name} es ${status}`)
  const paymentStatusKey = Object.entries(MP_PAYMENT_STATUS).find(e => e[1] === status)[0];
  await updateReserveByIdInMongoDB(
    reserve._id,
      {
        paymentStatus: PAYMENT_STATUS[paymentStatusKey],
      },
      { new: true}
  )
  }
} catch (err) {
  console.log('Ha ocurrido un error en la validación de un pago con el webhook de mercadopago:', err);
}
};

async function httpGetFeedbackReserve(req, res) {
  try {
  const payment = await mercadopago.payment.findById(req.query.payment_id);
  // const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
  // const preferenceId = merchantOrder.body.preference_id;
  console.log(preferenceId)
  const status = payment.body.status;
  const paymentStatusKey = Object.entries(MP_PAYMENT_STATUS).find(e => e[1] === status)[0];
  res.status(200).send({status: PAYMENT_STATUS[paymentStatusKey]});
  } catch (err) {
    console.log('Ha ocurrido un error en la validación del pago - ', err);
  }
};

module.exports = {
  httpAddNewReserve,
  httpGetAllReserves,
  httpGetReserve,
  httpDeleteReserve,
  httpUpdateReserve,
  httpPaymentReserveNotification,
  httpGetFeedbackReserve
};
