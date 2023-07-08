const mongoose = require("mongoose");

const reservesSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        dni: String,
        ticketQuantity: Number,
        email: String,
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        }, 
    },
    {
            timestamps: true
    },
)

module.exports = mongoose.model("Reserve", reservesSchema)