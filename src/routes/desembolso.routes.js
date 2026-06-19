const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/:creditoId", async (req, res) => {

  try {

    const { creditoId } = req.params;

    const credito = await pool.query(
      `
      SELECT *
      FROM creditos_preaprobados
      WHERE id = $1
      `,
      [creditoId]
    );

    if (credito.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Crédito no encontrado"
      });
    }

    const c = credito.rows[0];

    const userId = c.cliente_user_id;

    const cuenta = await pool.query(
      `
      SELECT *
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

    const cuentaId = cuenta.rows[0].id;

    const saldoActual =
      Number(cuenta.rows[0].saldo);

    const nuevoSaldo =
      saldoActual +
      Number(c.monto_preaprobado);

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
        $1,
        $2,
        'credito',
        'Desembolso préstamo',
        $3
      )
      `,
      [
        userId,
        cuentaId,
        c.monto_preaprobado
      ]
    );

    for (
      let i = 1;
      i <= c.plazo_meses;
      i++
    ) {

      const fecha =
        new Date();

      fecha.setMonth(
        fecha.getMonth() + i
      );

      await pool.query(
        `
        INSERT INTO cronograma_creditos
        (
          user_id,
          numero_cuota,
          fecha_vencimiento,
          monto,
          estado
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          'pendiente'
        )
        `,
        [
          userId,
          i,
          fecha,
          c.cuota_estimada
        ]
      );
    }

    await pool.query(
      `
      UPDATE creditos_preaprobados
      SET estado = 'desembolsado'
      WHERE id = $1
      `,
      [creditoId]
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

module.exports = router;