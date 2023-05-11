const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function intitialize(passport, getUserByEmail, getUserById) {
    
    //esta funcion recibe los datos del user y devuelve 
    const authenticateUser = async (email, password, done) => {
        // se trae el usuario y guarda en var.
        const user = getUserByEmail(email)
        // Si el usuario no existe entonces se pasa false:
        if (user == null) {
            return done(null, false, {message: "No user with that email"})
        }

        try {
            //Si el password coincide, true, y el done devuelve el usuario.
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
            //Si el password no coincide: false, y el done devuelve false.
                return done(null, false, {message:"Password incorrect."})
            }
        } catch (error){
            return done(error)
        }
    }
    
    //  1 esta linea crea la nueva estrategia local de authenticacion de usuarios. 

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

    //???
    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = intitialize