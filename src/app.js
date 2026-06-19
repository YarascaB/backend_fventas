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

const cronogramaRoutes =
    require(
      "./routes/cronograma.routes"
    );

const app = express();

app.use(
  "/api/cronograma",
  cronogramaRoutes
);



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

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Servidor corriendo en puerto ${PORT}`
    );
  }
);

const cuentasRoutes =
require("./routes/cuentas.routes");

app.use(
  "/api/cuentas",
  cuentasRoutes,
);

const ahorrosRoutes =
require("./routes/ahorros.routes");
app.use("/api/ahorros", ahorrosRoutes);

const transaccionesRoutes =
require("./routes/transacciones.routes");

app.use(
  "/api/transacciones",
  transaccionesRoutes
);

const transferenciasRoutes =
require("./routes/transferencias.routes");

app.use(
  "/api/transacciones",
  transferenciasRoutes
);

const misSolicitudesRoutes =
require("./routes/misSolicitudes.routes");

app.use(
  "/api/misSolicitudes",
  misSolicitudesRoutes
);

const buroRoutes =
require("./routes/buro.routes");

app.use(
  "/api/buro",
  buroRoutes
);

const desembolsoRoutes =
require("./routes/desembolso.routes");

app.use(
  "/api/desembolso",
  desembolsoRoutes
);