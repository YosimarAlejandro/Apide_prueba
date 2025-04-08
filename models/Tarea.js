const mongoose = require("mongoose");

const TareaSchema = new mongoose.Schema({
    pregunta: {
        type: String,
        required: true,
        trim: true
    },
    opciones: {
        type: [String], // Un array de strings para las opciones
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 2; // Asegura que haya al menos 2 opciones
            },
            message: "Debe haber al menos dos opciones."
        }
    },
    respuestaCorrecta: {
        type: String,
        required: true,
        validate: {
            validator: function (respuesta) {
                return this.opciones.includes(respuesta);
            },
            message: "La respuesta correcta debe estar en las opciones."
        }
    },
    puntaje: {
        type: Number,
        required: true,
        min: 1 // Asegura que el puntaje sea positivo
    }
}, { timestamps: true });

const Tarea = mongoose.model("Tarea", TareaSchema);

module.exports = Tarea;
