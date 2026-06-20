const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

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

      solicitudes: result.rows
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

module.exports = router;