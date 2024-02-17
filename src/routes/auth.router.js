const express = require("express")
const passport = require('passport') // este import no iria si se va el middleware de /login.
const {
    login, 
    logout,
    getUser,
    register,
    postRefreshToken
} = require('../controllers/auth.controller')
const { verifyUser } = require("../authenticate")

const authRouter = express.Router()

/* Este passport.authenticate.. va aca?? no puede ir en app.js, o en todo caso que
hace que no hace verifyUser */

authRouter.use("/login", passport.authenticate("local"), login) 
authRouter.use("/register", register)
authRouter.use('/me', verifyUser, getUser)
authRouter.use('/logout', verifyUser, logout)
authRouter.use('/refreshToken', postRefreshToken)

module.exports = authRouter;