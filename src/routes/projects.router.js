const express = require('express')
const {
    httpAddNewProject,
    httpGetAllProjects,
    httpGetProject,
    httpUpdateProject,
    httpToggleProjectStatus,
    httpDeleteProject,
} = require('../controllers/projects.controller')

const projectsRouter = express.Router()

projectsRouter.post('/', httpAddNewProject)
projectsRouter.get('/', httpGetAllProjects)
projectsRouter.get('/:id', httpGetProject)
projectsRouter.put('/:id', httpUpdateProject)
projectsRouter.put('/:id/toggle-status', httpToggleProjectStatus)
projectsRouter.delete('/:id', httpDeleteProject)

module.exports = projectsRouter;