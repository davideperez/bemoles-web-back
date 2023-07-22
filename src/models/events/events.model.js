const eventsDataBase = require('./events.mongo')

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

//CREATE
async function createEventByIdInMongoDB (event) {
    try {
        const newEvent = new eventsDataBase(event);
        return await newEvent.save();
    } catch (err) {
        console.error(`No se pudo crear el evento en la base de datos: ${err}`)
    }
} 

//READ
async function getAllEvents (page, items, search, isWorkshop, active, upcoming, published) {
    try {
        const query = {};
        
        if (search) query.title = { $regex: `${search}`, $options: 'i' };
        if (active) query.active = active === 'true'
        if (published) query.published = published === 'true'
        if (upcoming) {
            const currentDate = new Date();
            query.date = { [upcoming === 'true' ? '$gt' : '$lt']: currentDate } }

        query.isWorkshop = isWorkshop === 'true';

        const events = await eventsDataBase
        .find(query).populate('reserves')
        .skip((page - 1) * items) // 
        .limit(items)
        .sort({date: 'desc'});
        
        const count = await eventsDataBase.find(query).countDocuments();
        
        return ({values: events, count});
    } catch(err) {
        console.error(`No se pudieron traer los datos de todos los events desde mongoDB: ${err}`)
    }
}

async function getEvent (eventId) {
    try {
        const eventPopulated = await eventsDataBase.findById(eventId).populate('reserves')
        return eventPopulated;
    } catch(err) {
        console.error(`No se pudo traer el evento desde mongoDB: ${err}`)
    }
}


//UPDATE
async function updateEventByIdInMongoDB (eventId, event) {
    try {
        await eventsDataBase.findByIdAndUpdate(eventId, event, { new: true }) 
    } catch (err) {
        console.error(`No se pudo actualziar el evento en la base de datos: ${err}`)
    }
} 

//DELETE
async function deleteEventById (eventId) {
    await eventsDataBase.findByIdAndDelete(eventId)
} 

module.exports = {
    createEventByIdInMongoDB,
    getAllEvents,
    getEvent,
    updateEventByIdInMongoDB,
    deleteEventById
}