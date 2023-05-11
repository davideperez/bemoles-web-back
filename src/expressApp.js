///////////////////////////
// Imports
///////////////////////////

if (process.env.NODE_ENV !== 'production') { // ESTO VA CON ESTE IF?????
    require('dotenv').config()
}

const path = require('path');
const cors = require('cors')
const morgan = require('morgan')
const bcrypt = require('bcrypt') // tuto de login
const  express = require('express');
const passport = require('passport') // tuto de login
const flash = require('express-flash') // tuto de login
const session = require('express-session') // tuto de login
const intitializePassport = require('./configs/passport.config') // tuto de login


///////////////////////////
// Imports Propetary
///////////////////////////

const apiExpressRouter = require('./routes/apiExpressRouter');

/////////////////////
// App Setup
/////////////////////

const expressApp = express(); // Esto es un servidor HTTP.

/////////////////////////////////////////////////
/////////////////////////////////////////////////
////  TODELETE !!!!!!!!!!!!!!!!!! tutorial de login.
/////////////////////////////////////////////////
/////////////////////////////////////////////////

expressApp.set('view-engine', 'ejs')

const users = []

// para que la data del form vaya a req.body de una forma x q no entendi.

intitializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
    
    
expressApp.use(express.urlencoded({extended: false}))

expressApp.use(flash())

expressApp.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))     

expressApp.use(passport.initialize())
expressApp.use(passport.session())


//////////////////////////////
//////////////////////////////
////fin de tuto de login.
//////////////////////////////
//////////////////////////////


///////////////////////////
// Middleware
///////////////////////////

//Security
expressApp.use(cors({
    origin: 'http://localhost:3000',
}));


//Logs
expressApp.use(morgan('dev'));

//Reading Tools
expressApp.use(express.json()) // permite que los requests http lean jsons.

//??
expressApp.use(express.static(path.join(__dirname, '..', 'public'))); // este indica que la web se va a alojar en una carpeta fija?


///////////////////////////
// Routes Public
///////////////////////////


expressApp.use('/v1', apiExpressRouter); // 

expressApp.use('/*', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')) // esto es llamado al front.
})

//ruta tutorial de login


expressApp.get('/login', (req, res) => {
    res.render('/home/pc01user/Documents/projects/bemoles-web-back/public/views/login.ejs')
})

expressApp.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

expressApp.get('/register', (req, res) => {
    res.render('/home/pc01user/Documents/projects/bemoles-web-back/public/views/register.ejs')
})

expressApp.post('/register', async (req, res) => {
    try {
        // Recibe el pass ingresado, lo convierte a hash y lo guarda en var.
        const hashedPassword = await bcrypt.hash(req.body.password, 10) //10
        
        // Se agrega el nuevo usuario a la db.
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        
        // redirecciona al login:
        res.redirect('/login')
    } catch (error){ //va el error?
        res.redirect('register')
        console.log(`Error de registro: ${error}`)
    }
    console.log(users)
})

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next
    }

    res.redirect('login')
}

////////////////Fin rutas tuto de login.

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