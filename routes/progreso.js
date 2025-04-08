const express = require("express");
const mongoose = require("mongoose");
const Progreso = require('../models/Progreso');  // Modelo de Progreso

const router = express.Router();


// Obtener el progreso de un usuario específico
router.get("/progreso/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const progreso = await Progreso.find({ id_usuario })
      .sort({ fecha_progreso: -1 })
      .populate("id_tarea")    // Trae la info de la tarea
      .populate("id_usuario")  // Trae la info del usuario
      .populate("id_sesion");  // Trae la info de la sesión (si existe)

    // Si no se encuentra nada
    if (!progreso || progreso.length === 0) {
      return res.status(404).json({ error: "Progreso no encontrado para este usuario" });
    }

    // Respondemos con los registros
    res.json(progreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
