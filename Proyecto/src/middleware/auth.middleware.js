const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: Verifica que el request tenga un JWT válido
 * Extrae el token del header Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role, name, email }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware: Verifica que el usuario autenticado tenga rol ADMIN
 * Debe usarse DESPUÉS de verifyToken
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

module.exports = { verifyToken, isAdmin };
