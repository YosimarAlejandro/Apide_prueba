const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Usuario ya registrado" });
    }

    // Crear un nuevo usuario
    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();  // Encuentra todos los usuarios
    res.status(200).json(users);      // Envía la respuesta con la lista de usuarios
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// Ruta para obtener los datos del usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Se asume que authMiddleware asigna req.user correctamente
    const userId = req.user.user.id; // Dependiendo de cómo esté estructurado el payload
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({
      id: user.id,
      username: user.username, // o nombre, según tu modelo
      email: user.email,
    });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});



module.exports = router;