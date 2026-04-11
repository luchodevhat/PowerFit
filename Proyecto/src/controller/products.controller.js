const connectDB = require('../config/db');
const oracledb = require('oracledb');

/**
 * GET /api/products
 * Retorna todos los productos activos con su categoría.
 */
const getProducts = async (req, res) => {
    let connection;

    try {

        connection = await connectDB();

        const result = await connection.execute(
            `SELECT 
                P.PRODUCT_ID,
                P.NAME,
                P.DESCRIPTION,
                P.PRICE,
                P.STOCK,
                P.IMAGE_URL,
                P.IS_ACTIVE,
                C.SLUG AS CATEGORY,
                C.CATEGORY_ID
            FROM PRODUCTS P
            JOIN CATEGORIES C
            ON P.CATEGORY_ID = C.CATEGORY_ID
            WHERE P.IS_ACTIVE = 1`,
            [],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                fetchInfo: { "DESCRIPTION": { type: oracledb.STRING } }
            }
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Error fetching products" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

/**
 * POST /api/products
 * Crea un nuevo producto en la base de datos.
 * Requiere: name, slug, price, category_id
 * Opcionales: description, stock, image_url
 */
const createProduct = async (req, res) => {
    let connection;

    try {
        const { name, slug, description, price, stock, category_id, image_url } = req.body;

        // Validación básica
        if (!name || !slug || !price || !category_id) {
            return res.status(400).json({ error: 'Nombre, slug, precio y categoría son requeridos.' });
        }

        connection = await connectDB();

        await connection.execute(
            `INSERT INTO PRODUCTS (NAME, SLUG, DESCRIPTION, PRICE, STOCK, CATEGORY_ID, IMAGE_URL)
             VALUES (:name, :slug, :description, :price, :stock, :category_id, :image_url)`,
            {
                name,
                slug,
                description: description || null,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                category_id: parseInt(category_id),
                image_url: image_url || null
            },
            { autoCommit: true }
        );

        res.status(201).json({ message: 'Producto creado exitosamente.' });

    } catch (error) {
        console.error('Error creando producto:', error);

        // Error de slug duplicado (unique constraint)
        if (error.errorNum === 1) {
            return res.status(409).json({ error: 'Ya existe un producto con ese slug.' });
        }

        res.status(500).json({ error: 'Error al crear el producto.' });

    } finally {
        if (connection) await connection.close();
    }
};

/**
 * PUT /api/products/:id
 * Actualiza nombre y precio de un producto existente.
 */
const updateProduct = async (req, res) => {
    let connection;

    try {
        const { id } = req.params;
        const { name, price } = req.body;

        // Validación básica
        if (!name || !price) {
            return res.status(400).json({ error: 'Nombre y precio son requeridos.' });
        }

        connection = await connectDB();

        const result = await connection.execute(
            `UPDATE PRODUCTS SET NAME = :name, PRICE = :price WHERE PRODUCT_ID = :id`,
            {
                name,
                price: parseFloat(price),
                id: parseInt(id)
            },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto actualizado exitosamente.' });

    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct
};