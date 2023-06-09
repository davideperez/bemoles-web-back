const eventos = require('./eventos.json');
const adapterOldEventToEvent = require('../adapter/oldEvents')
const eventsDataBase = require('../models/events/events.mongo')

const seedEvents = async() => {
        const eventosMapped = eventos.map(e => adapterOldEventToEvent(e))
        await eventsDataBase.insertMany(eventosMapped);
        await delay(1000);
        process.stdout.write(`Inserted ${eventos.length} events\n`)
};

module.exports = seedEvents;