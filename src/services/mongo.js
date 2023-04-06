
//////////////////////////////
// Imports
//////////////////////////////
const mongoose = require('mongoose')
require('dotenv').config()

//////////////////////////////
// Varaibles & Constants
//////////////////////////////
const MONGO_URL = process.env.MONGO_URL;

//////////////////////////////
// Behaviours
//////////////////////////////
mongoose.set('strictQuery', false); //TODO: Averiguar de que la va esta linea.

mongoose.connection.once('open', () => { //TODO: Leer sobre esta funcion. sobre .once
    console.log('MongoDB connection ready!!🌱')
})

mongoose.connection.on('error', (err) => { //TODO: Leer sobre esta funcion. Sobre .on
    console.error(err);
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

//////////////////////////////
// Exports
//////////////////////////////

module.exports = {
    mongoConnect,
    mongoDisconnect
}