const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/transferir", async (req, res) => {

  const client = await pool.connect();

  try {

    const {
      senderUserId,
      receiverEmail,
      monto
    } = req.body;

    await client.query("BEGIN");

    // ==========================
    // EMISOR
    // ==========================

    const senderResult =
      await client.query(
        `
        SELECT *
        FROM cuentas
        WHERE user_id = $1
        LIMIT 1
        `,
        [senderUserId]
      );

    if (senderResult.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Cuenta origen no encontrada"
      });
    }

    const senderCuenta =
      senderResult.rows[0];

    // ==========================
    // RECEPTOR
    // ==========================

    const receiverUser =
      await client.query(
        `
        SELECT *
        FROM usuarios_mock
        WHERE email = $1
        `,
        [receiverEmail]
      );

    if (receiverUser.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Usuario destino no encontrado"
      });
    }

    const receiverUserId =
      receiverUser.rows[0].id;

    const receiverCuentaResult =
      await client.query(
        `
        SELECT *
        FROM cuentas
        WHERE user_id = $1
        LIMIT 1
        `,
        [receiverUserId]
      );

    if (
      receiverCuentaResult.rows.length === 0
    ) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Cuenta destino no encontrada"
      });
    }

    const receiverCuenta =
      receiverCuentaResult.rows[0];

    // ==========================
    // VALIDAR SALDO
    // ==========================

    if (
      Number(senderCuenta.saldo) <
      Number(monto)
    ) {

      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Saldo insuficiente"
      });
    }

    // ==========================
    // ACTUALIZAR SALDOS
    // ==========================

    await client.query(
      `
      UPDATE cuentas
      SET saldo = saldo - $1
      WHERE id = $2
      `,
      [monto, senderCuenta.id]
    );

    await client.query(
      `
      UPDATE cuentas
      SET saldo = saldo + $1
      WHERE id = $2
      `,
      [monto, receiverCuenta.id]
    );

    // ==========================
    // MOVIMIENTO EMISOR
    // ==========================

    await client.query(
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
        $1,
        $2,
        'debito',
        $3,
        $4
      )
      `,
      [
        senderUserId,
        senderCuenta.id,
        `Transferencia a ${receiverEmail}`,
        monto
      ]
    );

    // ==========================
    // MOVIMIENTO RECEPTOR
    // ==========================

    await client.query(
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
        $1,
        $2,
        'credito',
        $3,
        $4
      )
      `,
      [
        receiverUserId,
        receiverCuenta.id,
        `Transferencia recibida`,
        monto
      ]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Transferencia realizada"
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  } finally {

    client.release();
  }
});

module.exports = router;