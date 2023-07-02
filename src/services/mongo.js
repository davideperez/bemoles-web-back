const mongoose = require('mongoose')
require('dotenv').config()


const MONGO_URL = process.env.MONGO_URL;
//mongoose.set('strictQuery', false); 


mongoose.connection.once('open', () => { //Leer sobre esta funcion. sobre .once !!
    console.log('MongoDB connection ready!🌱')
})

// notificacion en caso de error
mongoose.connection.on('error', (err) => { //Leer sobre esta funcion. Sobre .on !!
    console.error(err);
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}