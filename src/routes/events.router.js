//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const express = require('express');
const { httpGetAllEvents, httpGetEvent, httpAddNewEvent, httpDeleteEvent, httpUpdateEvent } = require('../controllers/events.controller')

//-----------------------------------------------------------------------------------------------------//
// varaibles & constants
//-----------------------------------------------------------------------------------------------------//

const eventsRouter = express.Router()

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

eventsRouter.get('/:id', httpGetEvent);

eventsRouter.get('/', httpGetAllEvents);

eventsRouter.post('/', httpAddNewEvent);

eventsRouter.post('/:id', httpDeleteEvent);

eventsRouter.post('/:id', httpUpdateEvent);

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = eventsRouter;