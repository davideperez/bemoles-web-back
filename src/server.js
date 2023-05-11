///////////////////////////
// Imports
///////////////////////////

const http = require('http');
require('dotenv').config();
const bcrypt = require('bcrypt')

///////////////////////////
// Imports: Internal
///////////////////////////

const expressApp = require('./expressApp');
const { mongoConnect } = require('./services/mongo') //TODO

//const { loadEventosData } = require('models/eventos.model');

///////////////////////////
// Server Constants Setup
///////////////////////////

const PORT = process.env.PORT || 8000;

const server = http.createServer(expressApp);

///////////////////////////
// Middleware
///////////////////////////

//12345678

///////////////////////////
// Server Start Setup
///////////////////////////

async function startServer() {
    
    await mongoConnect();
    // await loadTalleresData();
    // await loadCursosData();

    server.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    });
};

///////////////////////////
// Server Starter
///////////////////////////

startServer();