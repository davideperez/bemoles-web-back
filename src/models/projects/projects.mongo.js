const mongoose = require("mongoose");

const projectsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        pdf: String,
        image: String,
        category: {
            type: String,
            enum: ["ANUALES", "SOLICITANDO_APOYOS", "NUESTROS_PROYECTOS", "INFORMES"],
            required: true,
        },
        info: {
            type: String,
        },
        active: {
            type:Boolean,
            default: true
        },
    },  
    {
        timestamps: true
    },
);

module.exports = mongoose.model("Project", projectsSchema)