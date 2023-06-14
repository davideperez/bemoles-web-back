const express = require("express")
const { register, login, postRefreshToken, getUser } = require('../controllers/auth.controller')
const passport = require('passport') // este import no iria si se va el middleware de /login.
const { verifyUser } = require("../authenticate")


const authRouter = express.Router()

authRouter.use("/register", register)
authRouter.use("/login", passport.authenticate("local"), login) // Este passport.authenticate.. va aca ?? no puede ir en app.js??
authRouter.use('/refreshToken', postRefreshToken)
authRouter.use('/me', verifyUser, getUser)


module.exports = authRouter


