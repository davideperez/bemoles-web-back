//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//
//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

const { getAllEvents, getEvent, saveEventInMongoDB } = require('../models/events/events.model');
const eventsMongo = require('../models/events/events.mongo');

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

async function httpGetAllEvents(req, res) {
    try {
        const { search, page, items } = req.query;
        return res.status(200).json(await getAllEvents(+page, +items, search));
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
};

async function httpGetEvent(req, res) {
    try {
        return res.status(200).json(await getEvent(req.params.id));
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
};

async function httpAddNewEvent(req, res) {
    const event = req.body 
    
    // 1 se chequea que el event a agregar posea todos los campos requeridos.
    if (!event.title || !event.date || !event.image ||!event.info || !event.price || !event.maxAttendance || !event.paymentLink) {
        return res.status(400).json({
            error: 'Falta cargar una de las propiedades del event.',
        })
    }

    // 2 Conversion del string date a objeto date de javascript.
    event.date = new Date(event.date)
   
    // 3 Se valida que la date no este vacia.
    if (isNaN(event.date)) {
        return res.status(400).json({
            error: 'date de event invalida.'
        })
    }

    // 4  // se agrega el event a la base de datos de Mongo(?? TODO)
    saveEventInMongoDB(event) 

    return res.status(201).json(event); // Esto es un check para POSTMAN?? TODO
};

async function httpDeleteEvent (req, res) {

    const eventFind = await eventsDatabase.findById(req.params.id);
    
    if (!eventFind) return res.status(400).send({success: false});
    
    if (eventFind.image && eventFind.image !== urlDefaultImage) {
      await removeFileToCloudinary(`${eventFind.image}`)
    }
  
    if (eventFind.images && eventFind.images.length > 0) {
      eventFind.images?.forEach(async (im) => {
        await removeFileToCloudinary(im);
      });
    }
  
    const productDeleteResponse = await eventsDatabase.findByIdAndRemove(req.params.id)
    if (!productDeleteResponse) return res.status(400).json({ success: false, message: "product not found!" });
        
    return res.status(200).json({ success: true, message: "the product is deleted!" });  
};

async function httpUpdateEvent (req, res) {

}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    httpGetAllEvents,
    httpGetEvent,
    httpAddNewEvent,
    httpDeleteEvent,
    httpUpdateEvent
};