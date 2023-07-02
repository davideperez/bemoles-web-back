const express = require('express');
const authRouter = require('./auth.router')
const eventsRouter = require('./events.router')
const reservesRouter = require('./reserves.router')
const projectsRouter = require('./projects.router')

const router = express.Router();

router.use('/eventos', eventsRouter);
router.use('/reservas', reservesRouter);
router.use('/proyectos', projectsRouter);
router.use('/auth', authRouter);

module.exports = router; 