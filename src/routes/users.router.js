//-----------------------------------------------------------------------------------------------------//
// Imports
//-----------------------------------------------------------------------------------------------------//
const express = require("express")
const { postSignUp, postLogin } = require('../controllers/users.controller')
const passport = require('passport') // este import no iria si se va el middleware de /login.


//-----------------------------------------------------------------------------------------------------//
// Logic
//-----------------------------------------------------------------------------------------------------//
const usersRouter = express.Router()

usersRouter.use("/signup", postSignUp)
usersRouter.use("/login", passport.authenticate("local"), postLogin) // Este passport.authenticate.. va aca ?? no puede ir en app.js??

//-----------------------------------------------------------------------------------------------------//
// Export
//-----------------------------------------------------------------------------------------------------//
module.exports = usersRouter