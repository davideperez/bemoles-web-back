const passport = require("passport")
const JwtStrategy = require("passport-jwt").Strategy, 
    ExtractJwt = require("passport-jwt").ExtractJwt
const User = require("../models//user/user.model")


const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log({jwt_payload})
      const user = await User.findOne({ _id: jwt_payload._id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    } catch (err) {
      return done(err, false);
    }
  })
)