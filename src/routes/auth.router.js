const express = require("express")
const passport = require('passport') // este import no iria si se va el middleware de /login.
const { verifyUser } = require("../authenticate")
const {
    register,
    login, 
    postRefreshToken,
    getUser,
    logout
} = require('../controllers/auth.controller')

const authRouter = express.Router()

authRouter.use("/register", register)
authRouter.use("/login", passport.authenticate("local"), login) // Este passport.authenticate.. va aca?? no puede ir en app.js, o en todo caso que hace que no hace verifyUser
authRouter.use('/refreshToken', postRefreshToken)
authRouter.use('/me', verifyUser, getUser)
authRouter.use('/logout', verifyUser, logout)

module.exports = authRouter