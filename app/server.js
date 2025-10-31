import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {  
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});


process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
