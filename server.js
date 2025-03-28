const express = require("express");
const cors = require("cors"); // Importa CORS
const mongoose = require("mongoose"); // Importa mongoose para la conexión a MongoDB
require('dotenv').config();

const app = express();

app.use(cors()); // Habilita CORS para todas las peticiones
app.use(express.json());

const user = require("./routes/auth");
app.use("/api/auth", user);

const sesionRoutes = require("./routes/sesion");
app.use("/api/sesion", sesionRoutes);

// const sesionTestRoutes = require("./routes/sesionRoutes");
// app.use("/api/sesion", sesionTestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));
