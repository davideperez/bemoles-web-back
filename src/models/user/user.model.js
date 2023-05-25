//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
// Imports //
//-----------------------------------------------------------------------------------------------------//

const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

//-----------------------------------------------------------------------------------------------------//
// Setups
//-----------------------------------------------------------------------------------------------------//

const Schema = mongoose.Schema

//-----------------------------------------------------------------------------------------------------//
// Schemas
//-----------------------------------------------------------------------------------------------------//

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
})

const User = new Schema({
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  points: {
    type: Number,
    default: 50,
  },
  refreshToken: {
    type: [Session], // de quien recibe ??
  },
})

//-----------------------------------------------------------------------------------------------------//
// Final Setups // Estos setups se podrian poner arriba ?? Probar cuando todo funcione.
//-----------------------------------------------------------------------------------------------------//

//Remove refreshToken from the response
User.set("toJSON", { // leer mas sobre este paso ?? !!
  transform: function (doc, ret, options) {
    delete ret.refreshToken
    return ret
  },
})

User.plugin(passportLocalMongoose)

//-----------------------------------------------------------------------------------------------------//
// Export
//-----------------------------------------------------------------------------------------------------//

module.exports = mongoose.model("User", User)