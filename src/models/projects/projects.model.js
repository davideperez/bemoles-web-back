const projectsDataBase = require('./projects.mongo')

// MOCK

const project = {
    title: "Concierto de Piano en Burzaco 3",
    date: new Date('May 25, 2023'),
    image: "flyer.jpg",
    info: "Concierto a cargo del pianista Pierre Aimard, obras de Messiaen.",
    price: 1500,
    maxAttendance: 800,
    paymentLink: 'https://www.mercadopago.com.ar',
}

//CREATE
async function createProjectByIdInMongoDB (project) {
    try {
        const newProject = new projectsDataBase(project);
        return await newProject.save();
    } catch (err) {
        console.error(`No se pudo crear el proyecto en la base de datos: ${err}`)
    }
} 

//READ
async function getAllProjects (page, items, search) {
    try {
        const query = {};
        if (search) query.title = { $regex: `${search}`, $options: 'i' };
        
        const projects = await projectsDataBase.find(query, {'__v': 0})
        .skip((page - 1) * items)
        .limit(items)
        .sort({createdAt: 'desc'});
        
        const count = await projectsDataBase.find(query).countDocuments();
        
        return ({values: projects, count});
    } catch(err) {
        console.error(`No se pudieron traerlos proyectos desde mongoDB: ${err}`)
    }
}

async function getProject (projectId) {
    try {
       return await projectsDataBase.findById(projectId);
    } catch(err) {
        console.error(`No se pudo traer el proyecto desde mongoDB: ${err}`)
    }
}

//UPDATE
async function updateProjectByIdInMongoDB (projectId, project) {
    try {
        await projectsDataBase.findByIdAndUpdate(projectId, project, { new: true }) 
    } catch (err) {
        console.error(`No se pudo actualziar el proyecto en la base de datos: ${err}`)
    }
}

//DELETE
async function deleteProjectById (projectId) {
    await projectsDataBase.findByIdAndDelete(projectId)
} 

module.exports = {
    createProjectByIdInMongoDB,
    getAllProjects,
    getProject,
    updateProjectByIdInMongoDB,
    deleteProjectById
}