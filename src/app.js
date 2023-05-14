//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const path = require('path');
const cors = require('cors')
const morgan = require('morgan')
const bcrypt = require('bcrypt') // tuto de login
const express = require('express');
const passport = require('passport') // tuto de login
const flash = require('express-flash') // tuto de login
const session = require('express-session') // tuto de login
if (process.env.NODE_ENV !== 'production') { // ESTO VA CON ESTE IF?????
    require('dotenv').config()
}

// Imports Propetary

const apiExpressRouter = require('./routes/apiExpressRouter');
const intitializePassport = require('./configs/passport.config') // tuto de login

//-----------------------------------------------------------------------------------------------------//
// Setups //
//-----------------------------------------------------------------------------------------------------//

const users = []

const app = express(); // Esto es un servidor HTTP.

intitializePassport( // login
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//app.set('views', path.join(__dirname, '..', 'public','views')) // login

app.set('view engine', 'ejs') // login

//-----------------------------------------------------------------------------------------------------//
// Middleware //
//-----------------------------------------------------------------------------------------------------//

// para que la data del form vaya a req.body de una forma x q no entendi.    
app.use(express.urlencoded({extended: false})) // login

app.use(flash()) // login

app.use(session({ // login
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize()) // login

app.use(passport.session()) // login

//Security
app.use(cors({
    origin: 'http://localhost:3000',
}));

//Logs
app.use(morgan('dev'));

//Reading Tools
app.use(express.json()) // permite que los requests http lean jsons.

//??
app.use(express.static(path.join(__dirname, '..', 'public', 'views'))); // Esta linea es para que express pueda devolvet a los get, files estaticos. ejs html.


//-----------------------------------------------------------------------------------------------------//
// Routes (Public) //
//-----------------------------------------------------------------------------------------------------//

app.use('/v1', apiExpressRouter); //

app.get('/', (req, res) => {
    res.render(path.join(__dirname, '..','public', 'views', 'index.ejs')) // esto es llamado al front.
})

app.get('/index', (req, res) => {
    res.render(path.join(__dirname, '..','public', 'views', 'index.ejs')) // esto es llamado al front.
})

//ruta tutorial de login

app.get('/login', (req, res) => { //login
    res.render(path.join(__dirname, '..', 'public', 'views', 'login.ejs'))
})

app.post('/login', passport.authenticate('local', { //login
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', (req, res) => { //login
    res.render(path.join(__dirname, '..','public', 'views', 'register.ejs'))
})

app.post('/register', async (req, res) => { //login
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

function isAuthenticated(req, res, next) { //login
    if (req.isAuthenticated()) {
        return next
    }

    res.redirect('login')
}

// app.get('/*', apiExpressRouter) // invento de DAvid, a chequear jaj.

// /Posibilidades TODO

// /Consultorios TODO

// /Sum - Arte TODO

// /Estudio y Sala de Ensayo TODO

// /Talleres TODO

// /Cartelera TODO

//-----------------------------------------------------------------------------------------------------//
// Routes (Admin) //
//-----------------------------------------------------------------------------------------------------//

// /Eventos (Cartelera) TODO

// /Talleres (Agregar Talleres) TODO

// /Proyectos (Agragar Proyectos) TODO

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = app;