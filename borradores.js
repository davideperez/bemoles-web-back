// Required dependencies
// Required dependencies
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Create user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create user model
const User = mongoose.model('User', userSchema);

// Initialize Express application
const app = express();

// Set up middleware
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
}));

// Set up Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport local strategy
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  });
}));

// Serialize user object to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user object from session
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Registration route
app.post('/register', (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const newUser = new User({
        username,
        password: hashedPassword,
      });

      newUser.save((err) => {
        if (err) {
          return next(err);
        }
        return res.json({ message: 'Registration successful.' });
      });
    });
  });
});

// Login route
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, 'your-secret-key');

    // Set the JWT token as a cookie
    res.cookie('jwt', token, { httpOnly:true });
   
    // Redirect or send response as desired
    return res.json({ message: 'Login successful.', user });

  })(req, res, next);
});

// Protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Access user info from request
  const user = req.user;
  res.json({ message: 'Protected route accessed.', user });
});
  
  // Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
  
  




/* 
server.js  // NODEJS http (es windows)

expressApp.js // EXPRESS (es photshop)

apiExpress.js // express.Router() (es crear un circulo)

eventos.routes.js // express.Router()

eventos.controller.js

eventos.interactor.js

eventos.model.js
    
eventos.mongo.js    
    mongoose.model
*/



/* EL server.js RESUMIDO.

require('http')
.createServer(require('./app'))
.listen(8000, () => {
    console.log(`Listening on port: ${8000}`);
})

*/



// Endpoint para hacer CRUD en db eventos.

// Endpoint para hacer CRUD en db taller y cursos.
// Endpoint para hacer CRUD en db proyectos
// login con o sin passport. http only cookies. 
// logica del mail.
    // body de mails (pedir a Dani.)
// agregar swager, libreria para documentar. 
