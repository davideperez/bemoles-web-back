const {
    createReserveByIdInMongoDB,
    getAllReserves,
    getReserve,
    updateReserveByIdInMongoDB,
    deleteReserveById,
  } = require("../models/reserves/reserves.model");


async function httpAddNewReserve(req, res) {
    try {
        const reserve = req.body;

        // 1 se chequea que la reserva a agregar posea todos los campos requeridos.
        if ( //?? que onda con el chequeo de q suba con imagen
          !reserve.firstName ||
          !reserve.lastName ||
          !reserve.dni ||
          !reserve.ticketQuantity ||
          !reserve.email ||
          !reserve.event

        ) { 
          return res.status(400).json({
            error: "Falta cargar una de las propiedades del event.",
          });
        }
    
        // 2 se restan los cupos del evento ??

        // 3 se envia el mail
        //TBD

        // 4 se agrega el event a la db en mongo atlas
        const reserveCreated = await createReserveByIdInMongoDB(reserve);
    
        return res.status(201).json(reserveCreated)
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpGetAllReserves(req, res) {
    try {
        const { search, page, items } = req.query;
        return res.status(200).json(await getAllReserves(+page, +items, search));
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpGetReserve(req, res) {
    try {
        return res.status(200).json(await getReserve(req.params.id));
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpUpdateReserve (req, res) {
    try {

        return res.status(201).json(reserveUpdated);
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpDeleteReserve (req, res) {
    try {

        return res.status(200).json({ success: true, message: "the reserve is deleted!" });
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}


module.exports = {
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpDeleteReserve,
    httpUpdateReserve
};