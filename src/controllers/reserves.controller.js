const {
  createReserveByIdInMongoDB,
  getAllReserves,
  getReserve,
  updateReserveByIdInMongoDB,
  deleteReserveById,
} = require("../models/reserves/reserves.model");

const {
  getEvent,
  updateEventByIdInMongoDB,
} = require("../models/events/events.model");

const {
  sendReserveConfirmationEmail,
} = require("../templates/reserve-confirmation");

const {
  sendStockAlertEmail,
} = require('../templates/stock-alert')

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
      return res
        .status(400)
        .json({
          success: false,
          message: "Falta cargar una de las propiedades del event.",
        });
    }

    // 2 se restan los cupos del evento ??
    const event = await getEvent(reserve.event);
    const maxAttendance = event.maxAttendance - reserve.ticketQuantity;

    if (event.maxAttendance < 10) await sendStockAlertEmail(event); // TO DO: Notificar a Gabriel cuando quedan menos de 10 entradas

    if (maxAttendance < 0) return res.status(409).json({message:"El cupo esta completo"});

    //2.5 se agrega el id de la reserva al array eventos.reserves

    // 3 se envia el mail
    //Estos campos se mandan desde aca, o se mandan el reserve y el event y se desglosa en el modulo /template/reserve-confirmation?

    // 4 se agrega el event a la db en mongo atlas
    const reserveCreated = await createReserveByIdInMongoDB(reserve);

    await updateEventByIdInMongoDB(reserve.event, {
      $set: { maxAttendance },
      $push: { reserves: reserveCreated._id.toString() },
    });

    await sendReserveConfirmationEmail(reserve, event);
    return res.status(201).json(reserveCreated);
  } catch (err) {
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

module.exports = {
  httpAddNewReserve,
  httpGetAllReserves,
  httpGetReserve,
  httpDeleteReserve,
  httpUpdateReserve,
};
