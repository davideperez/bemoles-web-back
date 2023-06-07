//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//
const express = require("express")
const { postSignUp, postLogin, postRefreshToken, getUser } = require('../controllers/users.controller')
const passport = require('passport') // este import no iria si se va el middleware de /login.
const { verifyUser } = require("../authenticate")



//-----------------------------------------------------------------------------------------------------//
// Logic
//-----------------------------------------------------------------------------------------------------//
const usersRouter = express.Router()

usersRouter.use("/signup", postSignUp)
usersRouter.use("/login", passport.authenticate("local"), postLogin) // Este passport.authenticate.. va aca ?? no puede ir en app.js??
usersRouter.use('/refreshToken', postRefreshToken)
usersRouter.use('/me', verifyUser, getUser)

//-----------------------------------------------------------------------------------------------------//
// Export
//-----------------------------------------------------------------------------------------------------//
module.exports = usersRouter