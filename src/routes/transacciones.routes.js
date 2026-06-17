const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(

      `
      SELECT
        id,
        tipo,
        descripcion,
        monto,
        fecha
      FROM transacciones
      WHERE user_id = $1
      ORDER BY fecha DESC
      LIMIT 20
      `,
      [userId]
    );

    res.json({

      success: true,

      movimientos: result.rows
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

router.post("/", async (req, res) => {

  try {

    const {
      userId,
      tipo,
      descripcion,
      monto
    } = req.body;

    const cuenta = await pool.query(
      `
      SELECT id, saldo
      FROM cuentas
      WHERE user_id = $1
      `,
      [userId]
    );

    if (cuenta.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta no encontrada"
      });
    }

    const cuentaId =
      cuenta.rows[0].id;

    const saldoActual =
      Number(cuenta.rows[0].saldo);

    let nuevoSaldo = saldoActual;

    if (tipo == "debito") {

      nuevoSaldo =
        saldoActual - Number(monto);

      if (nuevoSaldo < 0) {

        return res.status(400).json({

          success: false,

          message:
            "Saldo insuficiente"
        });
      }
    }

    if (tipo == "credito") {

      nuevoSaldo =
        saldoActual + Number(monto);
    }

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldo,
        cuentaId
      ]
    );

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      (
        $1,$2,$3,$4,$5
      )
      `,
      [
        userId,
        cuentaId,
        tipo,
        descripcion,
        monto
      ]
    );

    res.json({

      success: true,

      saldo: nuevoSaldo
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

router.post("/transferir", async (req, res) => {

  try {

    const {

      senderUserId,
      receiverEmail,
      monto

    } = req.body;

    // Cuenta origen

    const origen = await pool.query(

      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [senderUserId]
    );

    if (origen.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta origen no encontrada"
      });
    }

    // Usuario destino

    const usuarioDestino =
      await pool.query(

      `
      SELECT *
      FROM usuarios_mock
      WHERE email = $1
      `,
      [receiverEmail]
    );

    if (usuarioDestino.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Destinatario no encontrado"
      });
    }

    const receiverUserId =
      usuarioDestino.rows[0].id;

    // Cuenta destino

    const destino = await pool.query(

      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [receiverUserId]
    );

    if (destino.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta destino no encontrada"
      });
    }

    const saldoOrigen =
      Number(origen.rows[0].saldo);

    if (saldoOrigen < monto) {

      return res.status(400).json({

        success: false,
        message: "Saldo insuficiente"
      });
    }

    const nuevoSaldoOrigen =
      saldoOrigen - Number(monto);

    const nuevoSaldoDestino =
      Number(destino.rows[0].saldo) +
      Number(monto);

    // Actualizar saldos

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldoOrigen,
        origen.rows[0].id
      ]
    );

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldoDestino,
        destino.rows[0].id
      ]
    );

    // Movimiento origen

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      ($1,$2,'debito',$3,$4)
      `,
      [
        senderUserId,
        origen.rows[0].id,
        `Transferencia a ${receiverEmail}`,
        monto
      ]
    );

    // Movimiento destino

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      ($1,$2,'credito',$3,$4)
      `,
      [
        receiverUserId,
        destino.rows[0].id,
        `Transferencia recibida`,
        monto
      ]
    );

    res.json({

      success: true,
      message: "Transferencia realizada"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error: error.message
    });
  }
});

module.exports = router;