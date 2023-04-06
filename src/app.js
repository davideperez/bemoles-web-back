///////////////////////////
// Imports
///////////////////////////

const  express = require('express');
const path = require('path');
const cors = require('cors')

///////////////////////////
// Imports Propetary
///////////////////////////

const api = require('./routes/api');

/////////////////////
// App Setup
/////////////////////

const app = express();


///////////////////////////
// Middleware
///////////////////////////

app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(express.json())

app.use(express.static(path.join(__dirname, '..', 'public')));

///////////////////////////
// Routes Public
///////////////////////////

app.use('/v1', api); // 

// /
app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')) // esto es llamado al front.
})

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

module.exports = app;