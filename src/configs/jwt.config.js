//from https://www.bezkoder.com/node-js-express-login-mongodb/
// const config = require("../config/auth.config.js"); // aca va el secreto guardado.
const jwt = require("jsonwebtoken");
require('dotenv').config()

const jwtSecretKey = process.env.JWT_SECRET_KEY

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};


const authJwt = {
  verifyToken,
};

module.exports = authJwt;