//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const mongoose = require('mongoose')
const validator = require('validator');

//-----------------------------------------------------------------------------------------------------//
// Varaibles & Constants
//-----------------------------------------------------------------------------------------------------//

const eventsSchema = new mongoose.Schema({
    //TODO: Validar cuales de estos campos son required.
    //TODO: Armar types propios, ej type evento (type object)
    /*
    ejemplo: 
        type: { type: String, enum: ['PRODUCT', 'TEMPLATE', 'USER', 'WORLD'], },
    */

    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
    },
    flyer: {
        type: String, // usariamos una URL.
    },
    info: {
        type: String,
    },
    price: {
        type: Number,
    },
    maxAttendance: {
        type: Number,
    },
    paymentLink: {
        type: String,
        //TODO: Validar si esta validacion es necesaria.
        validate: {
            validator: isURL,
            message: `{VALUE} no es una URL VALIDA`
        }
    },
})

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

//TODO: Esta funcionalidad iria aca???s
function isURL(url) {
    return validator.isURL(url);
}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = mongoose.model('Event',eventsSchema) // TOCHECK: probar si esta linea se puede poner en una funcion aparte y poenr la funcion como export en module.exports.