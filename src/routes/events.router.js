const express = require('express');
const {
    httpAddNewEvent,
    httpGetAllEvents,
    httpGetEvent,
    httpUpdateEvent, 
    httpToggleEventStatus,
    httpDeleteEvent, 
} = require('../controllers/events.controller')


const eventsRouter = express.Router()

eventsRouter.post('/', httpAddNewEvent);
eventsRouter.get('/', httpGetAllEvents);
eventsRouter.get('/:id', httpGetEvent);
eventsRouter.put('/:id', httpUpdateEvent);
eventsRouter.put('/:id/toggle-status', httpToggleEventStatus)
eventsRouter.delete('/:id', httpDeleteEvent);


module.exports = eventsRouter;