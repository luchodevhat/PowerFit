const connectDB = require('../config/db');

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
                P.IMAGE_URL,
                C.SLUG AS CATEGORY
            FROM PRODUCTS P
            JOIN CATEGORIES C
            ON P.CATEGORY_ID = C.CATEGORY_ID
            WHERE P.IS_ACTIVE = 1`,
            [],
            {
                outFormat: require('oracledb').OUT_FORMAT_OBJECT,
                fetchInfo: { "DESCRIPTION": { type: require('oracledb').STRING } }
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

module.exports = {
    getProducts
};