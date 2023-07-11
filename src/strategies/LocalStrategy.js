const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/user/user.model")

//Called during login/sign up.
passport.use(new LocalStrategy(User.authenticate()))

//called while after logging in / signing up to set user details in req.user
passport.serializeUser(function(user, done) {
  console.log('user:', user)
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
      console.log('user:', user)
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
});