//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const { getAllEvents, saveEventInMongoDB } = require('../models/events/events.model');
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

async function httpAddNewEvent(req, res) {
    const event = req.body 
    
    // 1 se chequea que el event a agregar posea todos los campos requeridos.
    if (!event.nombre || !event.fecha || !event.hora || !event.fecha || !event.info || !event.precio || !event.cupoMaximo || !event.linkDePago) {
        return res.status(400).json({
            error: 'Falta cargar una de las propiedades del event.',
        })
    }

    // 2 Conversion del string fecha a objeto fecha de javascript.
    event.fecha = new Date(event.fecha)
   
    // 3 Se valida que la fecha no este vacia.
    if (isNaN(event.fecha)) {
        return res.status(400).json({
            error: 'Fecha de event invalida.'
        })
    }

    // 4  // se agrega el event a la base de datos de Mongo(?? TODO)
    saveEventInMongoDB(event) 

    return res.status(201).json(event); // Esto es un check para POSTMAN?? TODO
};

async function httpDeleteEvent (req, res) {

}

async function httpUpdateEvent (req, res) {

}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    httpGetAllEvents,
    httpAddNewEvent,
    httpDeleteEvent,
    httpUpdateEvent
};