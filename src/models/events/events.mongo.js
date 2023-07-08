const mongoose = require("mongoose");

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
    },
    isWorkshop: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Event", eventsSchema)