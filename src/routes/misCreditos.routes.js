const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM creditos_preaprobados
      WHERE cliente_user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Sin créditos"
      });
    }

    res.json({

      success: true,

      credito:
          result.rows[0]
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

module.exports = router;