//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')// Se podria desinstalar y usar el de express nativo directamente ??
const session = require('express-session')

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config();
}

const cookieParser = require("cookie-parser");
const fileUpLoad = require("express-fileupload");

// Imports Propetary

const router = require("./routes/router");

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");

// const insertSeeds = require('./seeders')

//-----------------------------------------------------------------------------------------------------//
// Setups //
//-----------------------------------------------------------------------------------------------------//

//EXPRESS Setup
const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

//CORS Setup
const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

const corsOptions = {
  origin: true,
  credentials: true,
};


//-----------------------------------------------------------------------------------------------------//
// Middleware //
//-----------------------------------------------------------------------------------------------------//

//Security
//TODO: Add the Helmet dependency.
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json()); // permite que los requests http lean jsons.
//Enables Express to serve static files
app.use(express.static(path.join(__dirname, "..", "public", "views")));

//Enables express to receive files.
app.use(
  fileUpLoad({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    //limits: { fileSize: 11 * 1024 * 1024 }
  })
);

//Auth

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
    // Aditional Options.
  })
);

//-----------------------------------------------------------------------------------------------------//
// Routes (Public) //
//-----------------------------------------------------------------------------------------------------//

app.use("/api", router); //

app.use(passport.session());
app.use(passport.initialize());

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "views", "index.html"));
  // res.send('Hola mundo')
});
// insertSeeds();

module.exports = app;
