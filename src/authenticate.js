const passport = require("passport")
const jwt = require("jsonwebtoken")
const nodeEnvironmentVariableValue = process.env.NODE_ENV !== "production"

const COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: !nodeEnvironmentVariableValue,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: false,
}

function getToken(user) {
  return jwt.sign(
    user,
    process.env.JWT_SECRET, 
    {expiresIn: eval(process.env.SESSION_EXPIRY),
  })
}

function getRefreshToken(user) {
  const refreshToken = jwt.sign(
    user,
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY)}
  )
  return refreshToken
}

const verifyUser = passport.authenticate("jwt", { session: false })

module.exports = {
    COOKIE_OPTIONS,
    getToken,
    getRefreshToken,
    verifyUser
}