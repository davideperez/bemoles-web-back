//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//
//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

const {
  getAllEvents,
  getEvent,
  createEventByIdInMongoDB,
  updateEventByIdInMongoDB,
} = require("../models/events/events.model");
const eventsMongo = require("../models/events/events.mongo");
const {
  removeFileToCloudinary,
  uploadFiletoCloudinary,
} = require("../helpers/cloudinary");

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

async function httpGetAllEvents(req, res) {
  try {
    const { search, page, items } = req.query;
    return res.status(200).json(await getAllEvents(+page, +items, search));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetEvent(req, res) {
  try {
    return res.status(200).json(await getEvent(req.params.id));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpAddNewEvent(req, res) {
  try {
    const event = req.body;

    // 1 se chequea que el event a agregar posea todos los campos requeridos.
    if (
      !event.title ||
      !event.date ||
      !event.info ||
      !event.price ||
      !event.maxAttendance ||
      !event.paymentLink
    ) {
      return res.status(400).json({
        error: "Falta cargar una de las propiedades del event.",
      });
    }

    // 2 SI LLEGAN ARCHIVOS, SE SUBEN A CLOUDINARY Y SE GUARDAN LAS URLS
    if (req.files) {
      const image = req.files.image;
      url = await uploadFiletoCloudinary(image);
      event.image = url;
    }

    // 3 se agrega el event a la base de datos de Mongo(?? TODO)
    const eventCreated = await createEventByIdInMongoDB(event);

    return res.status(201).json(eventCreated); // Esto es un check para POSTMAN?? TODO
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpUpdateEvent(req, res) {
    try {
      const event = req.body;
      const eventFind = await getEvent(req.params.id);
      if (!eventFind)
        return res.status(400).send({ message: "El evento no existe" });
  
      if (req.files?.image) {
        if (eventFind.image) await removeFileToCloudinary(`${eventFind.image}`);
        const image = req.files.image;
        url = await uploadFiletoCloudinary(image);
        event.image = url;
      }
      console.log({event})
      const eventUpdated = await updateEventByIdInMongoDB(req.params.id, event);
      return res.status(201).json(eventUpdated);
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  }

async function httpDeleteEvent(req, res) {
  try {
    const eventFind = await eventsDatabase.findById(req.params.id);

    if (!eventFind) return res.status(400).send({ success: false });

    if (eventFind.image) {
      await removeFileToCloudinary(`${eventFind.image}`);
    }

    await eventsDatabase.findByIdAndRemove(req.params.id);

    return res
      .status(200)
      .json({ success: true, message: "the product is deleted!" });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
  httpGetAllEvents,
  httpGetEvent,
  httpAddNewEvent,
  httpDeleteEvent,
  httpUpdateEvent,
};
