const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "Core Financiero - Fuerza de Ventas",
    version: "1.0.0",
    description:
      "API de Core Financiero para gestión de clientes, créditos, transacciones, desembolsos y operaciones bancarias digitales.",
    contact: {
      name: "Equipo de Desarrollo",
    },
  },

  servers: [
    {
      url: "https://backend-fventas.onrender.com",
      description: "Servidor Producción (Render)",
    },
    {
      url: "http://localhost:3000",
      description: "Servidor Local",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // todas tus rutas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;