const express = require('express');
const router = express.Router();

const { login, signup } = require('../controller/auth.controller');

// POST /api/auth/login — Iniciar sesión
router.post('/login', login);

// POST /api/auth/signup — Crear cuenta
router.post('/signup', signup);

module.exports = router;
