const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");  // Importamos axios para hacer solicitudes HTTP
require('dotenv').config();

const app = express();

app.use(cors());  // Habilita CORS para todas las peticiones
app.use(express.json());

// Rutas existentes
const user = require("./routes/auth");
app.use("/api/auth", user);

const tarea = require("./routes/tarea");
app.use("/api/tarea", tarea);

const sesionRoutes = require("./routes/sesion");
app.use("/api/sesion", sesionRoutes);

const tareaRoutes = require('./routes/progreso');
app.use('/api/progreso', tareaRoutes);

const logroRoutes = require('./routes/logro');
app.use('/api/logro', logroRoutes);

// Nueva ruta para enviar notificaciones usando FastAPI
app.post("/send-notification", async (req, res) => {
  const { input_data } = req.body; // Recibimos los datos de la solicitud

  try {
    // Hacemos la solicitud a FastAPI para obtener la predicción y enviar la notificación
    const response = await axios.post("http://127.0.0.1:8000/predict_and_notify", {
      input_data: input_data,  // Enviamos los datos de entrada
    });

    // Verificamos la respuesta de FastAPI
    if (response.data.status === "success") {
      res.status(200).json({
        message: "Notification sent successfully via FastAPI",  // Si es exitoso, devolvemos un mensaje de éxito
      });
    } else {
      res.status(400).json({
        message: response.data.message,  // Si hay algún error en la respuesta de FastAPI, lo enviamos
      });
    }
  } catch (error) {
    console.error("Error en la solicitud a FastAPI:", error);  // Si ocurre un error con la solicitud a FastAPI, lo manejamos
    res.status(500).json({
      message: "Error sending notification",  // Mensaje de error en caso de fallo
    });
  }
});

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
