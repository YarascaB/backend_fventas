const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const cuenta = await pool.query(
      `
      SELECT *
      FROM cuentas_ahorro
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

    const movimientos = await pool.query(
      `
      SELECT *
      FROM transacciones
      WHERE user_id = $1
      ORDER BY fecha DESC
      LIMIT 10
      `,
      [userId]
    );

    res.json({

      success: true,

      cuenta: cuenta.rows[0],

      movimientos: movimientos.rows
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