import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para parsear bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Importante para tests con JSON

// Configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

// Ruta principal: listar items
app.get("/", async (_req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM items");
    res.render("index", { items: results });
  } catch (err) {
    console.error("Error en GET /:", err);
    res.status(500).send(err.message);
  }
});

// 🔹 Mostrar formulario para crear un item
app.get("/create", (_req, res) => {
  res.render("create");
});

// Crear item (guardar en la base de datos)
app.post("/create", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send("El nombre es obligatorio");
    await db.query("INSERT INTO items (name) VALUES (?)", [name]);
    res.redirect("/");
  } catch (err) {
    console.error("Error en POST /create:", err);
    res.status(500).send(err.message);
  }
});

// Editar item
app.post("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) return res.status(400).send("El nombre es obligatorio");
    await db.query("UPDATE items SET name = ? WHERE id = ?", [name, id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error en POST /edit/:id:", err);
    res.status(500).send(err.message);
  }
});

// Eliminar item
app.post("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM items WHERE id = ?", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error en POST /delete/:id:", err);
    res.status(500).send(err.message);
  }
});

// Mostrar formulario para editar item
app.get("/edit/:id", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    if (results.length === 0) return res.status(404).send("Item no encontrado");
    res.render("edit", { item: results[0] });
  } catch (err) {
    console.error("Error en GET /edit/:id:", err);
    res.status(500).send(err.message);
  }
});


export default app;
