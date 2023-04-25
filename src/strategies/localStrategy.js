const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./models/user');

const app = express();

//TODO: configurar bcrypt.
//TODO: crear collection en mongo para user.
//TODO: Rutas: /login (LocalStrategy.js (el done es como un next que te lleva a login. y lleva al "controller login" es un metodo en user.ts.)),
//TODO: la logica login del controller user, sirve para mandar el token y user. en user linea 88 a 92 no irian porque es refreshToken  
//TODO: la function login, usa getToken que esta en authenticate.ts
//TODO: verifyUser es una estrategiapara usar 

/*

user.interactor.js

export const login = async (req: Request, res: Response) => {

  // busca el user en mongo
  const user = await User.findOne({email: req.body.email});
  

  //valida que el user llego.
  if (!user) return res.status(400).send({success: false}); 
  
  // valida que el pass coincida con 
  if(!bcrypt.compareSync(req.body.password, user.passwordHash)) return res.status(401).send({success: false});  // WIP: wrong credentials http status code error
  
  const token = getToken({ _id: req.user?._id });

  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(200)
      .send({
        success: true,
        user: user.email,
        token: token,
        favorites: user.favorites,
        cart: user.cart,
        isAdmin: user.isAdmin,
      });
};

*/





// Set up passport local strategy
passport.use(new LocalStrategy(
  async function(username, password, done) {
    const user = await User.findOne({ username: username })
    
    //validacion de user
    if (!user) return done(null, false)
    
    //validacion del pass
    if (!bcrypt.compareSync(password, user.password)) return done(null, false);
    
    //Success!
    return done(null, user);
}))

// Set up Express routes for login and protected pages
app.post('/login', passport.authenticate('local', {
     successRedirect: '/dashboard', failureRedirect: '/login' 
    }
));

app.get('/dashboard', isAuthenticated, function(req, res) {
  res.send('Welcome to the dashboard');
});

// Middleware function to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Start the server
app.listen(3000, function() {
  console.log('Server started on port 3000');
});