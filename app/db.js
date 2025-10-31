import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "itemsdb",
  port: process.env.DB_PORT || 3306,
});

console.log(`✅ Conectado a MySQL en ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}`);
export default db;
