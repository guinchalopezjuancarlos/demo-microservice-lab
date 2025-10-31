import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});

// Cerrar server correctamente con SIGTERM/SIGINT
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
