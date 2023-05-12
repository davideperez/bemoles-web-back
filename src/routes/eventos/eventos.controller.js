//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

//////////////////////////////
// Imports
//////////////////////////////

const { getAllEventos, saveEventoInMongoDB } = require('../../models/eventos/eventos.model');
const eventosMongo = require('../../models/eventos/eventos.mongo');

//////////////////////////////
// varaibles & constants
//////////////////////////////

//////////////////////////////
// sub-Behaviours
//////////////////////////////

//////////////////////////////
// Behaviours
//////////////////////////////

async function httpGetAllEventos(req, res) {
    return res.status(200).json(await getAllEventos()); //
};

async function httpAddNewEvento(req, res) {
    const evento = req.body 
    
    //se chequea que el evento a agregar posea todos los campos requeridos.
    if (!evento.nombre || !evento.fecha || !evento.hora || !evento.fecha || !evento.info || !evento.precio || !evento.cupoMaximo || !evento.linkDePago) {
        return res.status(400).json({
            error: 'Falta cargar una de las propiedades del evento.',
        })
    }

    //Conversion del string fecha a objeto fecha de javascript.
    evento.fecha = new Date(evento.fecha)
    //Se valida que la fecha no este vacia.
    if (isNaN(evento.fecha)) {
        return res.status(400).json({
            error: 'Fecha de evento invalida.'
        })
    }

    saveEventoInMongoDB(evento) // se agrega el evento a la base de datos de Mongo(??? TODO)

    return res.status(201).json(evento); // Esto es un check para POSTMAN???? TODO
};

//////////////////////////////
// Exports
//////////////////////////////

function sumarCosas () {

}

module.exports = {
    httpGetAllEventos,
    httpAddNewEvento,
};