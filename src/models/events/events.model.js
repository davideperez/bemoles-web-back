//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const eventsDataBase = require('./events.mongo')

//-----------------------------------------------------------------------------------------------------//
// Vars //
//-----------------------------------------------------------------------------------------------------//

// MOCK

const event = {
    title: "Concierto de Piano en Burzaco 3",
    date: new Date('May 25, 2023'),
    image: "flyer.jpg",
    info: "Concierto a cargo del pianista Pierre Aimard, obras de Messiaen.",
    price: 1500,
    maxAttendance: 800,
    paymentLink: 'https://www.mercadopago.com.ar',
}

// upsertEventByIdInMongoDB(event);

//-----------------------------------------------------------------------------------------------------//
// Behaviours //
//-----------------------------------------------------------------------------------------------------//

//getAllEvents
async function getAllEvents (page, items, search) {
    try {
        const query = {};
        if (search) query.title = { $regex: `${search}`, $options: 'i' };
        
        const events = await eventsDataBase.find(query, {'__v': 0})
            .skip((page - 1) * items)
            .limit(items);

        const count = await eventsDataBase.find(query).countDocuments();

        return ({values: events, count});
    } catch(error) {
        console.error(`No se pudieron traer los datos de todos los events desde mongoDB: ${error}`)
    }
}

//getEvent
async function getEvent (eventId) {
    try {
       return await eventsDataBase.findById(eventId);
    } catch(error) {
        console.error(`No se pudo traer el evento desde mongoDB: ${error}`)
    }
}

async function createEventByIdInMongoDB (event) {
    try {
        const newEvent = new eventsDataBase(event);
        return await newEvent.save();
    } catch (err) {
        console.error(`No se pudo crear el evento en la base de datos: ${err}`)
    }
} 

async function updateEventByIdInMongoDB (eventId, event) {
    try {
        await eventsDataBase.findByIdAndUpdate(eventId, event, { new: true }) 
    } catch (err) {
        console.error(`No se pudo actualziar el evento en la base de datos: ${err}`)
    }
} 

async function upsertEventByIdInMongoDB (event) { //TODO
    try {
        await eventsDataBase.updateOne({ //TODO validar si la que conviene es events.create() o events.updateOne()
            _id: event._id, 
        }, event, {
            upsert: true,
        }) 
    } catch (err) {
        console.error(`No se pudo salvar el event en la base de datos: ${err}`)
    }
} 

// agrega o actualiza el event a Mongo DB Atlas.
async function saveEventByTitleInMongoDB(event) { //TODO
    try {
        await eventsDataBase.updateOne({ //TODO validar si la que conviene es events.create() o events.updateOne()
            title: event.title, 
        }, event, {
            upsert: true,
        }) 
    } catch (err) {
        console.error(`No se pudo salvar el event en la base de datos: ${err}`)
    }
} 

//deleteEvents
async function deleteEventById (eventId) { //TODO

} 

//-----------------------------------------------------------------------------------------------------//
// Exports //
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    getAllEvents,
    getEvent,
    createEventByIdInMongoDB,
    updateEventByIdInMongoDB,
    upsertEventByIdInMongoDB,
    saveEventByTitleInMongoDB,
    deleteEventById
}