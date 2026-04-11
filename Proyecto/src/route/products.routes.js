const express = require('express');
const router = express.Router();

const { getProducts, createProduct, updateProduct } = require('../controller/products.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// GET /api/products — Listar productos (público)
router.get('/', getProducts);

// POST /api/products — Crear producto (solo admin)
router.post('/', verifyToken, isAdmin, createProduct);

// PUT /api/products/:id — Actualizar producto (solo admin)
router.put('/:id', verifyToken, isAdmin, updateProduct);

module.exports = router;