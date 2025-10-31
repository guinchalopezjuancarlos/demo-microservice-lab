import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.DB_HOST || "mysql-demo", 
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123",
  database: process.env.DB_NAME || "itemsdb",
});

console.log("✅ Conectado a MySQL en puerto 3306");

export default db;

