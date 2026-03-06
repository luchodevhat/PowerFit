const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRoutes = require('./src/route/products.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS) desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

app.use('/api/products', productsRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});