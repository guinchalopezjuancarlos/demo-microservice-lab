import request from "supertest";
import app from "../app.js";
import db from "../db.js";

describe("CRUD de Usuarios", () => {
  let createdId;

  beforeAll(async () => {
    // Crear base y tabla si no existen
    await db.query("CREATE DATABASE IF NOT EXISTS itemsdb;");
    await db.query("USE itemsdb;");
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
  });

  beforeEach(async () => {
    // Limpiar tabla antes de cada test
    await db.query("DELETE FROM items;");
  });

  afterAll(async () => {
    await db.end();
  });

  test("POST /create debería crear un usuario", async () => {
    const res = await request(app)
      .post("/create")
      .send({ name: "UsuarioTest" });
    expect(res.statusCode).toBe(302); // redirect a /
    
    // Verificar que el usuario realmente se insertó
    const [rows] = await db.query("SELECT * FROM items WHERE name = ?", ["UsuarioTest"]);
    expect(rows.length).toBe(1);
    createdId = rows[0].id; // guardar id para siguientes tests
  });

  test("GET / debería listar usuarios", async () => {
    await db.query("INSERT INTO items (name) VALUES (?)", ["UsuarioTest"]);
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("UsuarioTest");

    const [[user]] = await db.query("SELECT id FROM items LIMIT 1;");
    createdId = user.id;
  });

  test("POST /edit/:id debería actualizar un usuario", async () => {
    await db.query("INSERT INTO items (name) VALUES (?)", ["UsuarioTest"]);
    const [[user]] = await db.query("SELECT id FROM items LIMIT 1;");
    createdId = user.id;

    const res = await request(app)
      .post(`/edit/${createdId}`)
      .send({ name: "UsuarioEditado" });
    expect(res.statusCode).toBe(302);

    // Verificar que se actualizó
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [createdId]);
    expect(rows[0].name).toBe("UsuarioEditado");
  });

  test("GET / debería mostrar usuario editado", async () => {
    await db.query("INSERT INTO items (name) VALUES (?)", ["UsuarioEditado"]);
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("UsuarioEditado");
  });

  test("POST /delete/:id debería eliminar un usuario", async () => {
    await db.query("INSERT INTO items (name) VALUES (?)", ["UsuarioEditado"]);
    const [[user]] = await db.query("SELECT id FROM items LIMIT 1;");
    createdId = user.id;

    const res = await request(app).post(`/delete/${createdId}`);
    expect(res.statusCode).toBe(302);

    // Verificar que se eliminó
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [createdId]);
    expect(rows.length).toBe(0);
  });

  test("GET / no debería mostrar usuario eliminado", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).not.toContain("UsuarioEditado");
  });
});
