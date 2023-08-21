const mongoose = require("mongoose");

const reservesSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        dni: String,
        ticketQuantity: Number,
        email: String,
        MPPreferenceId: String,
        paymentLink: String,
        paymentStatus: {
            enum: ['NOT_PAID', 'FAILURE', 'PENDING', 'SUCCESS'],
            type: String,
            default: 'NOT_PAID',
        },
        payments: [{
            paymentId: String,
        }],
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