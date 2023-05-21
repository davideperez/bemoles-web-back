//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const express = require('express');
const authRouter = require('./auth.router')
const eventsRouter = require('./events.router')
const reservesRouter = require('./reserves.router')
const projectsRouter = require('./projects.router')
const usersRouter = require('./users.router')


//-----------------------------------------------------------------------------------------------------//
// Varaibles & Constants
//-----------------------------------------------------------------------------------------------------//

const router = express.Router();

//-----------------------------------------------------------------------------------------------------//
// Routes
//-----------------------------------------------------------------------------------------------------//

router.use('/auth', authRouter);

router.use('/eventos', eventsRouter);

router.use('/reservas', reservesRouter);

router.use('/proyectos', projectsRouter);

console.log("Including usersRouter")
router.use('/users', usersRouter);


//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = router; 