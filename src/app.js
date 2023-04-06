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

app.use('/v1', api);

app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


module.exports = app;