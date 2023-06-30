const mongoose = require("mongoose");
const validator = require("validator");

const eventsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    image: {
      type: String, // usariamos una URL.
    },
    info: {
      type: String,
    },
    price: {
      type: Number,
    },
    maxAttendance: {
      type: Number,
    },
    paymentLink: {
      type: String,
      //esta validacion es necesaria. ??
      validate: {
        validator: isURL,
        message: `{VALUE} no es una URL VALIDA`,
        },
    },
    active: {
      type: Boolean,
      default: true,
    }
  },  
  {
    timestamps: true
  },
);

//TODO: Esta funcionalidad iria aca???s
function isURL(url) {
  return validator.isURL(url)
}

module.exports = mongoose.model("Event", eventsSchema)