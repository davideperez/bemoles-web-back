//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const express = require('express')
const passport = require('passport')
//const flash = require('express-flash') // chequear si hay librerias para estos avisos !!
const bodyParser = require('body-parser')// Se podria desinstalar y usar el de express nativo directamente !!
if (process.env.NODE_ENV !== "production") {
    // Load environment variables from .env file in non prod environments
    require("dotenv").config()
}
//const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
// Imports Propetary

const router = require('./routes/router');
//const users = require('./models/user/user.model')
//const intitializePassport = require('./configs/passport.config')

//probar comentar estas 3 ya que no xe estan usando aca...
require("./strategies/JwtStrategy")
require("./strategies/LocalStrategy")
require("./authenticate")

//-----------------------------------------------------------------------------------------------------//
// Setups //
//-----------------------------------------------------------------------------------------------------//

//EXPRESS Setup
const app = express();

//PASSPORT Setup
/* intitializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
) */

//EJS Setup
//app.set('view engine', 'ejs')

app.use(bodyParser.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

//const userRouter = require("./routes/userRoutes")

//CORS Setup
const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : []

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  
  credentials: true,
}

//-----------------------------------------------------------------------------------------------------//
// Middleware //
//-----------------------------------------------------------------------------------------------------//


//Security
app.use(cors(corsOptions))

//Reading Tools
app.use(morgan('dev'));
app.use(express.json()) // permite que los requests http lean jsons.
//app.use(express.urlencoded({extended: false}))
//app.use(flash())// es necesario??

/* app.use(cookieSession({
    name: 'admin-session',
    keys: ['key1', 'key2'], 
    secret: process.env.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 1000, // ?? esto no va escondido en .env
    //secure: true, //
    //httpOnly: true // ?? para que es esta linea
})) */

app.use(passport.initialize())
//app.use(passport.session())

//Habilita a express a servir archivos estaticos.
//app.use(express.static(path.join(__dirname, '..', 'public', 'views')));

//-----------------------------------------------------------------------------------------------------//
// Routes (Public) //
//-----------------------------------------------------------------------------------------------------//

app.use('/api', router); //

app.get('/index', (req, res) => {
    res.send({status: 'success'})
    //res.render(path.join(__dirname, '..','public', 'views', 'index.ejs')) // esto es llamado al front.
})

//ruta tutorial de login

/* function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next
    }
    res.redirect('/auth/login')
} */

//-----------------------------------------------------------------------------------------------------//
// Exports
//-----------------------------------------------------------------------------------------------------//

module.exports = app;





//-----------------------------------------------------------------------------------------------------//

// vincular base datos.
// 1ero jswon web tokens. es el token de autenticacion. con un expire por dia.
// y luego guardo eso en la cookie
// el login que devuelva el nombre del usuario, no el id. 
// 
//-----------------------------------------------------------------------------------------------------//

//back
// paginado, filtros y busqueda. 
/* /Eventos
        get
            eventos?page=1$items=20$search=banda&taller=true
            tener en cuenta lo que va como query y lo que vuelve como respuesta.
            
            const query = {}
            query.search = {name: {$regex: `${search}`, $options: 'i'}}
            query.taller = true

            {
                values: [array de los objetos que cumple con la busqueda.]//20 items
                count: // el total para que arme el paginador.
            }
            await eventos.find(query) //la i es de mongoose, es include.
            .skip(page -1)*items)
            .limit(items)

            await eventos.find().coundtDocuments();
        post
        update(edit)
*/
