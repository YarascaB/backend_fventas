const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM notificaciones
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({

      success: true,

      notificaciones:
        result.rows
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

router.put("/:id/leida", async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE notificaciones
      SET leida = true
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

module.exports = router;