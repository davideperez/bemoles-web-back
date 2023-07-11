const eventos = require("./eventos.json");
const adapterOldEventToEvent = require("../adapter/oldEvents");
const eventsDataBase = require("../models/events/events.mongo");
const path = require("path");
const { uploadFiletoCloudinary } = require("../helpers/cloudinary");

const seedEvents = async () => {
  try {
        const eventosMapped = eventos.map((e) => adapterOldEventToEvent(e));
        for await (const event of eventosMapped) {
          if (event?.image?.length) {
            console.log({event})
            console.log({image: event.image})
            const imagePath = path.join(__dirname, "pics", event.image);
            const imageUrl = await uploadFiletoCloudinary({
              tempFilePath: imagePath,
            });
            event.image = imageUrl;
          }
          const eventToSave = new eventsDataBase(event);
          await eventToSave.save();
          eventsInserted++;
          process.stdout.write(`Inserted ${eventsInserted} events\n`);
        }
  } catch (err) {
    console.log(err);
  }
};

module.exports = seedEvents;