const mongoose = require("mongoose");

const reservesSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        dni: String,
        ticketQuantity: Number,
        email: String,
    },
    {
            timestamps: true
    },
)

module.exports = mongoose.model("Reserve", reservesSchema)