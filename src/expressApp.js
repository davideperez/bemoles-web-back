///////////////////////////
// Imports
///////////////////////////

const  express = require('express');
const path = require('path');
const cors = require('cors')

///////////////////////////
// Imports Propetary
///////////////////////////

const apiExpressRouter = require('./routes/apiExpressRouter');

/////////////////////
// App Setup
/////////////////////


const expressApp = express(); // Esto es un servidor HTTP.


///////////////////////////
// Middleware
///////////////////////////


expressApp.use(cors({
    origin: 'http://localhost:3000',
}));

expressApp.use(express.json()) // permite que los requests http lean jsons.

expressApp.use(express.static(path.join(__dirname, '..', 'public'))); // este indica que la web se va a alojar en una carpeta fija?


///////////////////////////
// Routes Public
///////////////////////////


expressApp.use('/v1', apiExpressRouter); // 

expressApp.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')) // esto es llamado al front.
})


// expressApp.get('/*', apiExpressRouter) // invento de DAvid, a chequear jaj.

// /Posibilidades TODO

// /Consultorios TODO

// /Sum - Arte TODO

// /Estudio y Sala de Ensayo TODO

// /Talleres TODO

// /Cartelera TODO

///////////////////////////
// Routes Admin
///////////////////////////

// /Eventos (Cartelera) TODO

// /Talleres (Agregar Talleres) TODO

// /Proyectos (Agragar Proyectos) TODO

///////////////////////////
// Exports
///////////////////////////

module.exports = expressApp;