const express = require('express')
const { verifyUser } = require('../authenticate')
const {
    httpAddNewProject,
    httpGetAllProjects,
    httpGetProject,
    httpUpdateProject,
    httpToggleProjectStatus,
    httpDeleteProject,
} = require('../controllers/projects.controller')

const projectsRouter = express.Router()

projectsRouter.post('/', verifyUser, httpAddNewProject)
projectsRouter.get('/', httpGetAllProjects)
projectsRouter.get('/:id', httpGetProject)
projectsRouter.put('/:id', verifyUser, httpUpdateProject)
projectsRouter.put('/:id/toggle-status', verifyUser, httpToggleProjectStatus)
projectsRouter.delete('/:id', verifyUser, httpDeleteProject)

module.exports = projectsRouter;