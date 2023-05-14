//-----------------------------------------------------------------------------------------------------//
// Imports (Native) //
//-----------------------------------------------------------------------------------------------------//

require('dotenv').config();
const http = require('http');

//Imports (Propertary)

const app = require('./app');
const { mongoConnect } = require('./services/mongo') //TODO
//const { loadEventosData } = require('models/eventos.model');

//-----------------------------------------------------------------------------------------------------//
// Server Setup //
//-----------------------------------------------------------------------------------------------------//

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer() {
    
    await mongoConnect();
    // await loadTalleresData();
    // await loadCursosData();

    server.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    });
};

//-----------------------------------------------------------------------------------------------------//
//Server Start //
//-----------------------------------------------------------------------------------------------------//

startServer();