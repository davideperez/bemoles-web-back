//TODO: leer sobre el pattern interactor para hacer agnositoc los .controller.js y los .model.js

//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//

const { } = require('../models/projects/projects.model');
const projectsMongo = require('../models/projects/projects.mongo');

//-----------------------------------------------------------------------------------------------------//
// Behaviours
//-----------------------------------------------------------------------------------------------------//

async function httpGetAllProjects(req, res) {
    return res.status(200).json(await getAllProjects()); //
};

async function httpAddNewProject(req, res) {
   
};

async function httpDeleteProject (req, res) {

}

async function httpUpdateProject (req, res) {

}

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    httpGetAllProjects,
    httpAddNewProject,
    httpDeleteProject,
    httpUpdateProject
};