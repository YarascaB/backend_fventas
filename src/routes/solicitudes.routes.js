const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.post("/", async (req, res) => {

  try {

    const {

      user_id,
      monto,
      plazo_meses,
      tasa_anual,
      proposito,

    } = req.body;

    // cálculo simple cuota mensual
    const cuota_mensual =
        (monto / plazo_meses).toFixed(2);

    const result = await pool.query(

      `
      INSERT INTO solicitudes_prestamo (

        user_id,
        monto,
        plazo_meses,
        tasa_anual,
        cuota_mensual,
        estado,
        proposito

      )

      VALUES ($1,$2,$3,$4,$5,$6,$7)

      RETURNING *
      `,

      [

        user_id,
        monto,
        plazo_meses,
        tasa_anual,
        cuota_mensual,
        "pendiente",
        proposito,
      ]
    );

    res.json({

      success: true,

      solicitud: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT

        sp.id,
        sp.monto,
        sp.estado,
        sp.plazo_meses,
        sp.created_at,

        pc.nombres,
        pc.apellidos

      FROM solicitudes_prestamo sp

      JOIN perfiles_clientes pc
      ON sp.user_id = pc.user_id

      ORDER BY sp.created_at DESC
      `
    );

    res.json({

      success: true,

      solicitudes: result.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const { estado } = req.body;

    const result = await pool.query(

      `
      UPDATE solicitudes_prestamo

      SET estado = $1

      WHERE id = $2

      RETURNING *
      `,

      [estado, id]
    );
    const solicitud = result.rows[0];

      await pool.query(
      `
      INSERT INTO notificaciones
      (
          user_id,
          titulo,
          mensaje
      )
      VALUES
      (
          $1,
          $2,
          $3
      )
      `,
      [
          solicitud.user_id,
          "Estado de Solicitud",
          `Tu solicitud fue ${estado}`
      ]);

    res.json({

      success: true,

      solicitud: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

router.get("/cliente/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(

      `
      SELECT *
      FROM solicitudes_prestamo
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({

      success: true,

      solicitudes: result.rows,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

module.exports = router;