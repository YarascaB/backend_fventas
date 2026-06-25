const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    // primero buscar solicitud del cliente

    const solicitud = await pool.query(
      `
      SELECT *
      FROM solicitudes_prestamo
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (solicitud.rows.length > 0) {

      return res.json({
        success: true,
        credito: solicitud.rows[0]
      });
    }

    // si no existe solicitud buscar crédito preaprobado

    const credito = await pool.query(
      `
      SELECT *
      FROM creditos_preaprobados
      WHERE cliente_user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (credito.rows.length > 0) {

      return res.json({
        success: true,
        credito: credito.rows[0]
      });
    }

    return res.status(404).json({
      success: false,
      message: "Sin créditos"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;