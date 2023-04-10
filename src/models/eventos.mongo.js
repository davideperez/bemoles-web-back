//////////////////////////////
// Imports
//////////////////////////////


const mongoose = require('mongoose')
const validator = require('validator');


//////////////////////////////
// Varaibles & Constants
//////////////////////////////


const eventosSchema = new mongoose.Schema({
    //TODO: Validar cuales de estos campos son required.
    nombre: {
        type: String,
        required: true,
    },
    fecha: {
        type: Date,
    },
    hora: {
        type: String,
    },
    flyer: {
        type: String, // TODO: Updetear de String a Buffer y ver como se implementa. Este escenario es nuevo. Deberia aceptar un jpg.(?) Supuestamente omngodb atlas convierte el jpeg en BJSON.
    },
    info: {
        type: String,
    },
    precio: {
        type: Number,
    },
    cupoMaximo: {
        type: Number,
    },
    linkDePago: {
        type: String,
        //TODO: Validar si esta validacion es necesaria.
        validate: {
            validator: isURL,
            message: '{VALUE} no es una URL VALIDA'
        }
    },
})


//////////////////////////////
// Behaviours
//////////////////////////////


//TODO: Esta funcionalidad iria aca???s
function isURL(url) {
    return validator.isURL(url);
}


//////////////////////////////
// Exports
//////////////////////////////


module.exports = mongoose.model('Evento',eventosSchema) // TOCHECK: probar si esta linea se puede poner en una funcion aparte y poenr la funcion como export en module.exports.