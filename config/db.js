require("dotenv").config();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

(async () => {
  try {
    await db.getConnection();
    console.log("MySQL Connected");
  } catch (err) {
    console.error("DB Connection Failed:", err);
  }
})();

module.exports = db;