//-----------------------------------------------------------------------------------------------------//
// Imports (Native) //
//-----------------------------------------------------------------------------------------------------//

require('dotenv').config(); //Aca no va con el if tambien ??
const http = require('http');

//Imports (Propertary)
const app = require('./app');
const { mongoConnect } = require('./services/mongo')

//-----------------------------------------------------------------------------------------------------//
// Server Setup //
//-----------------------------------------------------------------------------------------------------//

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer() {
    
    await mongoConnect();
    //extra data to load before app start.
    server.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    });
};

//-----------------------------------------------------------------------------------------------------//
//Server Start //
//-----------------------------------------------------------------------------------------------------//

startServer();