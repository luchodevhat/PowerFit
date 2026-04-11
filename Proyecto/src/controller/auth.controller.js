const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
require('dotenv').config();

/**
 * POST /api/auth/login
 * Autentica al usuario con email y password.
 * Retorna un JWT con userId, name, email y role.
 */
const login = async (req, res) => {
    let connection;

    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        connection = await connectDB();

        // Buscar usuario por email, incluyendo el nombre del rol
        const result = await connection.execute(
            `SELECT U.USER_ID, U.NAME, U.EMAIL, U.PASSWORD, R.ROLE_NAME
             FROM USERS U
             JOIN ROLES R ON U.ROLE_ID = R.ROLE_ID
             WHERE U.EMAIL = :email`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const user = result.rows[0];

        // Comparar contraseña hasheada
        const validPassword = await bcrypt.compare(password, user.PASSWORD);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        // Generar JWT (expira en 8 horas)
        const token = jwt.sign(
            {
                userId: user.USER_ID,
                name: user.NAME,
                email: user.EMAIL,
                role: user.ROLE_NAME
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                userId: user.USER_ID,
                name: user.NAME,
                email: user.EMAIL,
                role: user.ROLE_NAME
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) await connection.close();
    }
};

/**
 * POST /api/auth/signup
 * Crea un nuevo usuario con rol CLIENT (ROLE_ID = 2).
 * El password se hashea con bcrypt antes de guardarse.
 */
const signup = async (req, res) => {
    let connection;

    try {
        const { name, email, password } = req.body;

        // Validación básica
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        connection = await connectDB();

        // Verificar si el email ya existe
        const existing = await connection.execute(
            `SELECT USER_ID FROM USERS WHERE EMAIL = :email`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
        }

        // Hashear password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar usuario con rol CLIENT (ROLE_ID = 2)
        await connection.execute(
            `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE_ID)
             VALUES (:name, :email, :password, 2)`,
            { name, email, password: hashedPassword },
            { autoCommit: true }
        );

        res.status(201).json({ message: 'Cuenta creada exitosamente.' });

    } catch (error) {
        console.error('Error en signup:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { login, signup };
