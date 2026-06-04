require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/auth.routes");

const clientesRoutes =
    require("./routes/clientes.routes");

const clienteDetalleRoutes =
    require("./routes/clienteDetalle.routes");

const solicitudesRoutes =
    require("./routes/solicitudes.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/clientes", clientesRoutes);

app.use("/api/clientes", clienteDetalleRoutes);

app.use("/api/solicitudes", solicitudesRoutes);

app.get("/", (req, res) => {

  res.json({
    message: "API funcionando"
  });
});

const PORT = 3000;

app.listen(PORT,'0.0.0.0', () => {

  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );
});

