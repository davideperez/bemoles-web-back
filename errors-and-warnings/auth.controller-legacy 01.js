const path = require('path');
const bcrypt = require('bcrypt')
const users = require('../src/models/user/user.model')


async function getLogin (req, res) {
    res.render(path.join(__dirname, '..', '..','public' ,'views', 'login.ejs'))

}

async function postLogin (req, res) {
    successRedirect: '/eventos'
    failureRedirect: '/auth/login'
    failureFlash: true
}


async function getRegister (req, res) {
    res.render(path.join(__dirname, '..', '..','public' ,'views', 'register.ejs'))
}


async function postRegister (req, res) {
    console.log('Llege a post.register.controller')
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
        res.redirect('/auth/login')
    } catch (error){ //va el error?
        res.redirect('/auth/register') // aca... en teoria va solo registe ??
        console.log(`Error de registro: ${error}`)
    }
    console.log(users)
}

async function postLogout (req, res) {
    if (req.cookies['jwt']) {
        res
        .clearCookie('jwt')
        .status(200)
        .json({
            message: 'You have logged out'
        })
    } else {
        res.status(401).json({
            error: 'Invalid jwt'
        })
    }
}

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    postLogout
}