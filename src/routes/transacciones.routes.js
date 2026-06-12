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

module.exports = router;