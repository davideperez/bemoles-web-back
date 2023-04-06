///////////////////////////
// Imports
///////////////////////////

const http = require('http');

require('dotenv').config();
const cors = require('cors');

///////////////////////////
// Imports Propetary
///////////////////////////

const app = require('./app');
//const {mongoConnect } = require('./services/mongo) // TODO
//const { loadTalleresData } = require('models/talleres.model');

///////////////////////////
// Server Constants Setup
///////////////////////////

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

///////////////////////////
// Middleware
///////////////////////////



///////////////////////////
// Server Start Setup
///////////////////////////

async function startServer() {
    
    // await mongoConnect();
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