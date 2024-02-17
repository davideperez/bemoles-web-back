const {    
    createProjectByIdInMongoDB,
    getAllProjects,
    getProject,
    updateProjectByIdInMongoDB,
    deleteProjectById
} = require('../models/projects/projects.model')
const {
    removeFileToCloudinary,
    uploadFiletoCloudinary,
  } = require("../helpers/cloudinary");

  
async function httpAddNewProject(req, res) {
    try {
        const project = req.body;

        // 1 se chequea que el project a agregar posea todos los campos requeridos.
        if (
          !project.title ||
          !project.category
          //TBD agregar el chequeo de la info aqui. 
        ) {
          return res.status(400).json({
            error: "Falta cargar una de las propiedades del proyecto.",
          });
        }
    
        // 2 SI LLEGAN ARCHIVOS, SE SUBEN A CLOUDINARY Y SE GUARDAN LAS URLS
        if (req.files) {
          const image = req.files.image
          imageUrl = await uploadFiletoCloudinary(image);
          project.image = imageUrl

          const pdf = req.files.pdf
          pdfUrl = await uploadFiletoCloudinary(pdf);
          project.pdf = pdfUrl
        }
    
        // 3 se agrega el project a la base de datos de Mongo
        const projectCreated = await createProjectByIdInMongoDB(project);
        return res.status(201).json(projectCreated)
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
};

async function httpGetAllProjects(req, res) {
    try {
        const { search, page, items } = req.query;
        return res.status(200).json(await getAllProjects(+page, +items, search));
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
};

async function httpGetProject(req, res) {
    try {
        return res.status(200).json(await getProject(req.params.id));
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
};

async function httpUpdateProject (req, res) {
    try {
        const project = req.body

        const projectFind = await getProject(req.params.id)
        if (!projectFind) return res.status(400).send({message: "El proyecto no existe."})
        
        if(req.files?.image) {
            // se borra imagen actual del proyecto
            if(projectFind.image) await removeFileToCloudinary(`${projectFind.image}`)
        
            // se carga la nueva imagen, se guarda en cloudinary y se agrega al nuevo project.
            const image = req.files.image
            url = await uploadFiletoCloudinary(image)
            project.image = url
        }

        if(req.files?.pdf) {
            // se borra imagen actual del proyecto
            if(projectFind.pdf) await removeFileToCloudinary(`${projectFind.pdf}`)
        
            // se carga el nuevo pdf, se guarda en cloudinary y se agrega al nuevo project.
            const pdf = req.files.pdf
            url = await uploadFiletoCloudinary(pdf)
            project.pdf = url
        }

        
        const projectUpdated = await updateProjectByIdInMongoDB(req.params.id, project)

        if(!projectFind.category) return res.status(400).send({message: "El proyecto no tiene tag de categoria."}) // !!?? problema con este update, no e
        
        return res.status(201).json(projectUpdated)

    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }    
}

async function httpToggleProjectStatus (req, res) {
    try {

        const projectFind = await getProject(req.params.id)
        if (!projectFind) return res.status(400).send({message: "El proyecto no existe."})

        projectFind.active = !projectFind.active
        await updateProjectByIdInMongoDB(req.params.id, projectFind) // o esta linea ??: const projectUpdated = await updateProjectByIdInMongoDB(req.params.id, project)

        return res.status(200).json({ success: true, message: `The project status was set to ${projectFind.active}` });

    } catch (err) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpDeleteProject (req, res) {
    try {
        const projectFind = await getProject(req.params.id);
    
        //Se valida q exista el evento
        if (!projectFind) return res.status(400).send({ success: false, message:"El proyecto no existe." });
    
        // Se borra la imagen de Cloudinary
        if (projectFind.image) {
          await removeFileToCloudinary(`${projectFind.image}`);
        }

        // Se borra la imagen de Cloudinary
        if (projectFind.pdf) {
            await removeFileToCloudinary(`${projectFind.pdf}`);
          }
        // Se borra el evento de la db.
        await deleteProjectById(req.params.id);
    
        return res.status(200).json({ success: true, message: "El proyecto ha sido borrado" });
      
      } catch (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
}

module.exports = {
    httpAddNewProject,
    httpGetAllProjects,
    httpGetProject,
    httpUpdateProject,
    httpToggleProjectStatus,
    httpDeleteProject,
};