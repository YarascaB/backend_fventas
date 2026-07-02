const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Core Financiero - Fuerza de Ventas",
    version: "1.0.0",
    description:
      "API de Core Financiero para gestión de clientes, créditos, transacciones y operaciones bancarias digitales.",
  },
  servers: [
    {
      url: "https://backend-fventas.onrender.com",
      description: "Servidor Producción",
    },
  ],
};

const options = {
  definition: swaggerDefinition,

  // 🔥 CLAVE: ruta absoluta correcta en Render
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJSDoc(options);