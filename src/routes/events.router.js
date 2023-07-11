const express = require('express');
const { verifyUser } = require('../authenticate');
const {
    httpAddNewEvent,
    httpGetAllEvents,
    httpGetEvent,
    httpUpdateEvent, 
    httpToggleEventStatus,
    httpDeleteEvent, 
} = require('../controllers/events.controller')


const eventsRouter = express.Router()

eventsRouter.post('/', verifyUser, httpAddNewEvent);
eventsRouter.get('/', httpGetAllEvents);
eventsRouter.get('/:id', httpGetEvent);
eventsRouter.put('/:id', verifyUser, httpUpdateEvent);
eventsRouter.put('/:id/toggle-status', verifyUser, httpToggleEventStatus)
eventsRouter.delete('/:id', verifyUser, httpDeleteEvent);


module.exports = eventsRouter;