const oracledb = require('oracledb');
require('dotenv').config();

async function connectDB() {
    try {
        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });

        console.log("✅ Connected to Oracle DB");
        return connection;
    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
}

module.exports = connectDB;