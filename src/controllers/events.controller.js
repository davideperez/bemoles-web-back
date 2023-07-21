const {
  getAllEvents,
  getEvent,
  createEventByIdInMongoDB,
  updateEventByIdInMongoDB,
  deleteEventById,
} = require("../models/events/events.model");
const {
  removeFileToCloudinary,
  uploadFiletoCloudinary,
} = require("../helpers/cloudinary");


async function httpAddNewEvent(req, res) {
  try {
    const event = req.body;

    // 1 se chequea que el event a agregar posea todos los campos requeridos.
    if ( //?? que onda con el chequeo de q suba con imagen
      !event.title ||
      !event.date ||
      !event.info
    ) {
      return res.status(400).json({
        error: "Falta cargar una de las propiedades del event.",
      });
    }

    // 2 SI LLEGAN ARCHIVOS, SE SUBEN A CLOUDINARY Y SE GUARDAN LAS URLS
    if (req.files) {
      const image = req.files.image;
      url = await uploadFiletoCloudinary(image);
      event.image = url;
    }

    event.active = event.active === 'true';
    event.published = event.published === 'true';

    // 3 se agrega el event a la db en mongo atlas
    const eventCreated = await createEventByIdInMongoDB(event);

    return res.status(201).json(eventCreated)
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetAllEvents(req, res) {
  try {
    const { search, page, items, isWorkshop } = req.query;
      return res.status(200).json(await getAllEvents(+page, +items, search, isWorkshop));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetEvent(req, res) {
  try {
    const eventId = req.params.id
    return res.status(200).json(await getEvent(eventId));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpUpdateEvent(req, res) {
    try {
      
      // 1 captura el evento posteado por el user.
      const event = req.body; 
      
      //2 se valida q exista el evento pedido por url, y se hace una copia en eventFind.
      const eventFind = await getEvent(req.params.id); // 
      if (!eventFind)
        return res.status(400).send({ message: "El evento no existe" });
      
      // 3 Si el update incluye una imagen nueva..
      // el signo de pregunta indica q e la imagen puede o no estar siendo actualizada.
      if (req.files?.image) { 
        //.. entonces, si el evento ya tenia imagen, se borra esa vieja imagen de cloudinary..
        if (eventFind.image) await removeFileToCloudinary(`${eventFind.image}`);
        //.. se guarda la imagen nueva en image
        const image = req.files.image;
        // se ejecuta la funcion q guarda la imagen en cloudinary y devuelve la url de la misma.. se guarda esta url en url.
        url = await uploadFiletoCloudinary(image);
        // se asigna al objeto event del request, la url de la nueva imagen.. y..
        event.image = url;
      }
      console.log({event})
      event.active = event.active === 'true';
      event.published = event.published === 'true';

      //4 ..se actualiza el evento en la db 
      const eventUpdated = await updateEventByIdInMongoDB(req.params.id, event);
      
      return res.status(201).json(eventUpdated);
    } catch (err) {
      return res.status(500).json({
        error: err.message,
    });
  }
}

async function httpToggleEventStatus (req, res) {
  try {
      const eventFind = await getEvent(req.params.id)
      if (!eventFind) return res.status(400).send({message: "El evento no existe."})

      const event = {};
      if (req.query.type === 'published') {
        event.published = !eventFind.published;
      } else {
        event.active = !eventFind.active;
      }
      await updateEventByIdInMongoDB(req.params.id, event) // o esta linea ??: const projectUpdated = await updateProjectByIdInMongoDB(req.params.id, project)

      return res.status(200).json({ success: true, message: `El estado del proyecto fue seteado a ${typeof event.active === 'boolean' ? event.active : event.published}` });

  } catch (err) {
      return res.status(500).json({
          error: err.message,
      })
  }
}

async function httpDeleteEvent(req, res) {
  try {
    const eventFind = await getEvent(req.params.id);

    //Se valida q exista el evento
    if (!eventFind) return res.status(400).send({ success: false, message:"El evento no existe." });

    // Se borra la imagen de Cloudinary
    if (eventFind.image) {
      await removeFileToCloudinary(`${eventFind.image}`);
    }
    // Se borra el evento de la db.
    await deleteEventById(req.params.id);

    return res.status(200).json({ success: true, message: "El evento ha sido borrado" });
  
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  httpAddNewEvent,
  httpGetAllEvents,
  httpGetEvent,
  httpUpdateEvent,
  httpToggleEventStatus,
  httpDeleteEvent,
};