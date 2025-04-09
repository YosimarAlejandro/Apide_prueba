const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Tarea = require('../models/Tarea');  // Modelo de Tarea
const Progreso = require('../models/Progreso');  // Modelo de Progreso
const authMiddleware = require('../middlewares/authMiddleware');


// Obtener todas las tareas
router.get("/alltareas", async (req, res) => {
  try {
    const allTarea = await Tarea.find();
    res.json(allTarea);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener las tareas" });
  }
});

// Crear una nueva tarea
router.post("/add", async (req, res) => {
  try {
    const newTarea = new Tarea(req.body);
    await newTarea.save();
    res.status(201).json(newTarea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar tarea por ID
router.delete("/:id", async (req, res) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
});

// Responder a una tarea y guardar el progreso
// Responder a una tarea y guardar el progreso
router.post("/:id/responder", authMiddleware, async (req, res) => {
  try {
    const { respuesta, id_sesion } = req.body; // ya no necesitas id_usuario en el body
    const { id } = req.params; // Este 'id' es el ID de la Tarea

    // Obtenemos el id del usuario desde el token
    const id_usuario = req.user.user.id;

    // Verificamos si el ID de la tarea es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de tarea no válido" });
    }

    const tarea = await Tarea.findById(id);
    if (!tarea) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    // Validar si la respuesta es correcta
    const esCorrecta = tarea.respuestaCorrecta === respuesta;

    // Si es correcta, asignamos el puntaje de la tarea
    const puntajeAsignado = esCorrecta ? tarea.puntaje : 0;

    // Creamos un nuevo registro en la colección de Progreso
    const nuevoProgreso = new Progreso({
      id_usuario,   // El usuario autenticado que respondió
      id_tarea: id, // Referencia a la tarea
      id_sesion,    // Referencia a la sesión, si se envía (opcional)
      puntaje: puntajeAsignado,
      correcto: esCorrecta,
      fecha_progreso: new Date()
    });

    // Guardamos el progreso en la base de datos
    await nuevoProgreso.save();

    // Respondemos con el resultado
    res.json({
      mensaje: esCorrecta ? "Respuesta correcta" : "Respuesta incorrecta",
      puntaje: puntajeAsignado,
      progreso: nuevoProgreso
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Obtener tareas por bloque
router.get("/tareas/bloque/:bloque", async (req, res) => {
  const bloque = parseInt(req.params.bloque);

  if (isNaN(bloque)) {
    return res.status(400).json({ error: "Bloque inválido. Debe ser un número." });
  }

  try {
    const tareasPorBloque = await Tarea.find({ bloque });
    res.json(tareasPorBloque);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las tareas por bloque." });
  }
});


module.exports = router;
