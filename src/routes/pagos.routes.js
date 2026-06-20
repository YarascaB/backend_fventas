const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM pagos
      WHERE user_id = $1
      ORDER BY fecha DESC
      `,
      [userId]
    );

    const totalPagado =
      result.rows.reduce(
        (sum, item) =>
          sum + Number(item.monto),
        0
      );

    res.json({

      success: true,

      totalPagado,

      cantidad:
        result.rows.length,

      pagos:
        result.rows
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message
    });
  }
});

module.exports = router;