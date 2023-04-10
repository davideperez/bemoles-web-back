//////////////////////////////
// Imports
//////////////////////////////
const eventosDataBase = require('./eventos.mongo')

//////////////////////////////
// Varaibles & Constants
//////////////////////////////

const evento = {
    nombre: "Concierto de Piano en Burzaco 2",
    fecha: new Date('May 25, 2023'),
    hora: "20:30hs",
    flyer: "flyer.jpg",
    info: "Concierto a cargo del pianista Pierre Aimard, obras de Messiaen.",
    precio: 1500,
    cupoMaixmo: 800,
    linkDePago: 'https://www.mercadopago.com.ar',
}

//////////////////////////////
// Behaviours
//////////////////////////////

addEvento(evento)
console.log('Cupo Maximo:', evento.cupoMaixmo)

//getAllEventos
async function getAllEventos () { //TODO
    try {
        return await eventosDataBase.find({}, {'_id':0, '__v': 0})
    } catch(error) {
        console.error(`No se pudieron traer los datos de todos los eventos desde mongoDB: ${error}`)
    }
}

// addEvento
async function addEvento (evento) { //TODO
    try {
        await eventosDataBase.updateOne({ //TODO validar si la que conviene es eventos.create() o eventos.updateOne()
            nombre: evento.nombre,
/*          fecha: evento.fecha,
            hora: evento.hora,
            flyer: evento.flyer,
            info: evento.info,
            precio: evento.precio,
            cupoMaixmo: evento.cupoMaixmo,
            linkDePago: evento.linkDePago, */
        }, evento, {
            upsert: true,
        }) 
    } catch (err) {
        console.error(`No se pudo salvar el evento en la base de datos: ${err}`)
    }
} 

//deleteEventos
async function deleteEventoById () { //TODO

} 

//////////////////////////////
// Exports
//////////////////////////////

module.exports = {
    getAllEventos,
    addEvento,
    deleteEventoById
}