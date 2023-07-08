const mongoose = require("mongoose");
const eventsDB = require("./events.mongo");
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  try {
    const events = await eventsDB.find({}); // Fetch all existing documents

    for (const event of events) {
      event.reserves = []; // Set the new property value for each document
      await event.save()
      console.log(event.title); // Save the updated document
    }

    console.log("Migration completed successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Migration failed", error);
  }
});


